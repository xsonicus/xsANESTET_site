# QK Cosmetic Admin MVP

## Что реализовано

- статическая страница `/admin/`, совместимая с текущим `output: "export"`;
- отдельный loopback-only Node.js service для входа и управления каталогом;
- серверная PBKDF2-проверка пароля без пароля или хеша в браузерной сборке;
- `HttpOnly`, `SameSite=Strict`, `Secure` session cookie, точный Origin check и CSRF token;
- ограничение попыток входа;
- добавление и изменение товаров, обычной и старой цены, признаков `Новинка`, `Скидка`, `Опубликован`;
- раздел `Интеграции` для 1С, СДЭК и универсального connector API;
- безопасный server-side preflight конфигурации без передачи ключей в браузер;
- проверка скидки: старая цена обязана быть выше текущей;
- атомарное JSON-хранилище, optimistic revision check и append-only audit log.

Это не `localStorage`: данные сохраняются сервером в `/var/lib/anestet`. Сессии намеренно хранятся только в памяти процесса и сбрасываются при рестарте сервиса.

## Почему API не находится в `app/api`

Проект использует `output: "export"`. В этом режиме Next.js поддерживает только статически генерируемые GET Route Handlers. POST/PATCH, request cookies и Server Actions требуют request-time server и несовместимы с текущей сборкой. Поэтому UI остаётся статическим, а защищённый API запускается отдельным сервисом, аналогично существующему Order API.

## Контракт товара

См. `lib/admin/contract.ts`. Цена хранится целым числом рублей:

```json
{
  "id": 60,
  "sku": "QK-RECOVERY-200",
  "brand": "QUEEN KEY",
  "title": "Восстанавливающие сливки с Д-пантенолом, 200 мл",
  "compactTitle": "Recovery Milk · 200 мл",
  "tag": "После процедуры",
  "image": "/assets/img/optimized/slivki-cutout.webp",
  "price": 890,
  "compareAtPrice": 1190,
  "isNew": true,
  "isDiscount": true,
  "active": true
}
```

`revision` и `updatedAt` добавляет сервис. При PATCH клиент обязан передать последнюю `revision`; устаревшая запись получает HTTP 409.

## Создание хеша пароля

Запустите локально и перенесите только результат в закрытый `/etc/anestet/admin-api.env`:

```bash
node -e 'const c=require("node:crypto");const p=process.argv[1];if(!p)throw Error("pass password as one argument");const i=310000,s=c.randomBytes(16),h=c.pbkdf2Sync(p,s,i,32,"sha256");console.log(`pbkdf2-sha256$${i}$${s.toString("base64url")}$${h.toString("base64url")}`)' 'CHANGE-ME'
```

Не используйте `CHANGE-ME` как настоящий пароль и не сохраняйте команду с реальным паролем в shell history. Более безопасный вариант — запустить команду в временной закрытой shell-сессии или с чтением из защищённого secret manager.

## Запуск сервиса

1. Скопировать `docs/admin/admin.env.example` в `/etc/anestet/admin-api.env` и заполнить секреты с правами `0600`.
2. Разместить каталог `lib/admin` в `/var/www/anestet/current-admin`.
3. Запустить:

```bash
set -a
. /etc/anestet/admin-api.env
set +a
/usr/local/bin/node /var/www/anestet/current-admin/server.mjs
```

4. Проверить только loopback endpoint: `curl --fail http://127.0.0.1:4318/api/admin/health`.

## systemd unit

```ini
[Unit]
Description=ANESTET catalog admin API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
EnvironmentFile=/etc/anestet/admin-api.env
ExecStart=/usr/local/bin/node /var/www/anestet/current-admin/server.mjs
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/anestet

[Install]
WantedBy=multi-user.target
```

## nginx location

Этот блок должен находиться **выше** существующего `location /api/`:

```nginx
location /api/admin/ {
    proxy_pass http://127.0.0.1:4318;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 3s;
    proxy_read_timeout 15s;
    client_max_body_size 64k;
}
```

После изменения: `nginx -t`, затем reload. Не публикуйте порт 4318 в firewall.

## API

| Method | Path | Назначение |
| --- | --- | --- |
| GET | `/api/admin/health` | Health check без секретов |
| POST | `/api/admin/session` | Вход, выдача cookie + CSRF token |
| GET | `/api/admin/session` | Восстановление активной сессии |
| DELETE | `/api/admin/session` | Выход |
| GET | `/api/admin/products` | Каталог |
| POST | `/api/admin/products` | Добавление товара |
| PATCH | `/api/admin/products/:id` | Изменение товара с revision check |
| GET | `/api/admin/integrations` | Маскированный статус конфигурации коннекторов |
| POST | `/api/admin/integrations/:id/check` | Fail-closed проверка готовности подключения |

Все `/api/admin/*` endpoints каталога требуют HttpOnly session cookie. Публичный read-only `/api/catalog` доступен витрине без сессии. Изменяющие запросы дополнительно требуют точный `Origin` и `X-CSRF-Token`.

## Интеграции и секреты

Коннекторы конфигурируются только через закрытый `/etc/anestet/admin-api.env`:

| Интеграция | Обязательные переменные |
| --- | --- |
| 1С | `ONEC_API_URL`, `ONEC_API_TOKEN` |
| СДЭК | `CDEK_API_URL`, `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET` |
| VK публикации | `VK_GROUP_DOMAIN`, `VK_ACCESS_TOKEN`, `VK_API_VERSION`; токен также можно безопасно сохранить из админки при настроенном `ANESTET_CONNECTOR_SECRETS_KEY` |
| Универсальный сервис | `ANESTET_CONNECTOR_URL`, `ANESTET_CONNECTOR_TOKEN` |

Правила безопасности:

- endpoint обязан использовать HTTPS;
- URL не может содержать login/password, query string или fragment;
- API никогда не возвращает URL, token, client ID или secret — только полностью маскированный признак наличия;
- секретные значения не записываются в `catalog.json`, `vk-feed.json` или `admin-audit.jsonl`;
- audit проверки содержит только ID интеграции, итоговый state и `externalRequestMade: false`;
- browser bundle знает только имена полей статуса, но не получает env-значения.

Для 1С, СДЭК и универсального коннектора endpoint проверки выполняет безопасный configuration preflight. Если переменных не хватает, он возвращает HTTP 409 и не делает исходящий запрос. Если реквизиты полные, но конкретный protocol adapter ещё не установлен, он возвращает HTTP 501 `adapter_pending` и также не делает исходящий запрос.

VK — первый активный контентный адаптер. Он делает POST только на allowlisted `https://api.vk.com/method/wall.get`, нормализует видео и новости с фотографиями, отбрасывает неизвестные player/preview hosts и сохраняет результат в `ANESTET_VK_FEED_STORE`. Синхронизация не публикует новые материалы автоматически: в `/admin/` необходимо выбрать товар и включить публикацию. Токен, введённый в админке, шифруется AES-256-GCM в `ANESTET_CONNECTOR_SECRETS_STORE` ключом из `ANESTET_CONNECTOR_SECRETS_KEY`; публичный API и статусы никогда не возвращают его значение.

Для активации реального probe каждый connector adapter должен отдельно определить endpoint/метод, timeout, авторизацию, допустимые hosts, redaction ошибок и тесты, не меняя публичный маскированный контракт.

## Фактический контур публикации

Общий catalog contour уже подключён в коде:

- admin service читает и атомарно изменяет `ANESTET_CATALOG_STORE`;
- production-витрина загружает активные товары через публичный read-only `/api/catalog` (на localhost намеренно остаётся статический preview fallback);
- Order API читает тот же `ANESTET_CATALOG_STORE` перед каждым заказом и повторно рассчитывает цену на сервере;
- если общий файл ещё не создан, оба сервиса используют проверенный 23-товарный fallback. Это обеспечивает запуск, но не заменяет production seed общего файла.

После создания общего `catalog.json` и указания одного абсолютного пути обоим сервисам изменение товара в панели становится доступно витрине при следующей загрузке каталога, а Order API валидирует заказ уже по этой версии данных.

## Production-состояние и следующие интеграции

- Общий `/var/lib/anestet/catalog.json` развёрнут и используется витриной, Order API и Admin API; исходные 23 товара проверены.
- Оба сервиса работают только на loopback за публичным TLS nginx, а закрытые env-файлы имеют серверные права доступа и не входят в Git.
- `/admin/`, health/login/catalog smoke и ежедневный защищённый backup данных и конфигурации активны на VPS.
- VK feed и зашифрованное хранилище реквизитов включаются в backup вместе с каталогом и audit; без сохранённого токена адаптер остаётся fail-closed и витрина показывает одну честную ссылку на официальное сообщество.
- Загрузка медиа намеренно ещё не реализована: поле изображения принимает только уже опубликованный путь `/assets/…`, поэтому админка не может сохранить несовместимый внешний URL.
- Когда появится официальный API 1С, нужно письменно определить master-data приоритет, SKU mapping, обработку конфликтов и режим ручных override с аудитом.
- СДЭК и остальные коннекторы активируются только после реализации и тестирования конкретных server-side adapters. До этого HTTP 409/501 и `externalRequestMade: false` являются ожидаемым безопасным состоянием.
