export type ProductDetails = {
  description: string;
  usage: string;
  composition: string;
  purpose?: string;
  advantages?: string;
  sourceUrl: string;
};

const source = (path: string) => `https://qkcosmetic.ru/${path}`;

const primaryBase: Omit<ProductDetails, "sourceUrl"> = {
  description: "Охлаждающий гель для подготовки кожи к косметологическим процедурам. Снижает чувствительность и неприятные ощущения, обеспечивая необходимый комфорт во время процедур.",
  usage: "Нанесите гель слоем 1–2 мм на предварительно обезжиренную и продезинфицированную кожу. При необходимости накройте участок окклюзиционной плёнкой. Выдержите 20–40 минут; для продолжительных процедур — до 1 часа. Удалите остатки салфеткой или ватным диском. Перед применением рекомендуется тест на чувствительность согласно инструкции на упаковке.",
  composition: "Aqua, AnestetTMNF, Glycerin, Ricinus Communis (Castor) Seed Oil, Sodium Polyacrylate, Ethylhexyl Cocoate, PPG-3 Ether Myristate, Polysorbate 20, PEG-40 Hydrogenated Castor Oil, Xanthan Gum, DMDM Hydantoin, Triethanolamine, Aroma, Methylchloroisothiazolinone, Methylisothiazolinone.",
  purpose: "Косметологические процедуры; нанесение и удаление татуировок; перманентный макияж; эпиляция.",
  advantages: "Эффективное охлаждение, контролируемая текстура без растекания, увлажнение и смягчение кожи.",
};

const primaryFion: Omit<ProductDetails, "sourceUrl"> = {
  description: "Охлаждающий гель с новой формулой для подготовки кожи к косметологическим процедурам, с более сильным и глубоким действием.",
  usage: "Нанесите гель слоем 1–2 мм на очищенную и продезинфицированную кожу. При необходимости используйте окклюзиционную плёнку. Для тела выдержите 10–30 минут, для лица — 5–10 минут; при продолжительных процедурах время для тела можно увеличить до 45 минут. Удалите остатки. Перед применением рекомендуется тест на чувствительность.",
  composition: "Aqua, FION™NF, Shea Butter (Refined), Sodium Cetearyl Sulfate, Polysorbate 20, Carbomer, Polysorbate 80, Triethanolamine, Sodium Hydroxide, Aroma, Methylchloroisothiazolinone, Methylisothiazolinone.",
  purpose: "Косметологические процедуры; нанесение и удаление татуировок; перманентный макияж.",
  advantages: "Быстрое снижение чувствительности и дискомфорта; плотная, контролируемая текстура.",
};

const secondaryBase: Omit<ProductDetails, "sourceUrl"> = {
  description: "Гель для использования после первичного этапа. Продлевает и усиливает эффект, помогая сохранить комфорт во время процедуры.",
  usage: "Нанесите тонким слоем на прорабатываемую зону аппликатором, ватным тампоном или микробрашем. Подождите 5–15 секунд, удалите остатки и продолжите процедуру. Средство используют на повреждённой коже после начала перманентного макияжа, микроблейдинга или тату. Перед применением рекомендуется тест на чувствительность.",
  composition: "Aqua, Anestet™LTA, Hydroxyethylcellulose, Sodium Metabisulfite, Sodium Chloride, Tetrasodium EDTA, CI 42090, CI 19140, DMDM Hydantoin, Methylchloroisothiazolinone, Methylisothiazolinone.",
  purpose: "Нанесение татуировок; перманентный макияж; микроблейдинг.",
  advantages: "Быстрое охлаждение, универсальность для разных типов кожи, контролируемое нанесение.",
};

const secondaryFion: Omit<ProductDetails, "sourceUrl"> = {
  ...secondaryBase,
  composition: "Aqua, Fion™LTA, Hydroxyethylcellulose, Sodium Metabisulfite, Sodium Chloride, Tetrasodium EDTA, CI 77742, DMDM Hydantoin, Methylchloroisothiazolinone, Methylisothiazolinone.",
};

const lightFrost: Omit<ProductDetails, "sourceUrl"> = {
  description: "Light Frost помогает снизить неприятные ощущения перед косметологическими процедурами. Плотная текстура не растекается, а формула рассчитана на более глубокое и быстрое действие.",
  usage: "Нанесите средство слоем 1–2 мм на обезжиренную и продезинфицированную кожу, накройте пищевой плёнкой на 20–60 минут. Рекомендуемая экспозиция — около 40 минут, на лице — не более 20 минут. Не наносить на слизистые, повреждённые и воспалённые участки кожи. Полные противопоказания сверяйте с упаковкой.",
  composition: "Aqua, Anestoderm, Carbomer, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide.",
  purpose: "Косметологические процедуры; нанесение и удаление татуировок; перманентный макияж; эпиляция.",
  advantages: "Интенсивное и ускоренное действие; плотная текстура; увлажняющие и успокаивающие свойства.",
};

const lightDep: Omit<ProductDetails, "sourceUrl"> = {
  description: "Light Dep — охлаждающий гель для подготовки кожи перед косметологическими и эстетическими процедурами. Классическая формула и плотная консистенция обеспечивают удобное равномерное нанесение.",
  usage: "Нанесите средство слоем 1–2 мм на очищенную и обезжиренную неповреждённую кожу, накройте пищевой плёнкой и выдержите 20–60 минут (обычно 20–40 минут). Снимите плёнку и удалите остатки перед процедурой.",
  composition: "Aqua, Anestoderm, Carbomer, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide, Parfum.",
  purpose: "Косметологические и инъекционные процедуры; мезотерапия; контурная пластика; биоревитализация; татуаж, перманентный макияж, татуировки и эпиляция.",
  advantages: "Проверенная формула, комфортное воздействие, универсальность и стандартный режим работы мастера.",
};

const lightDepPro: Omit<ProductDetails, "sourceUrl"> = {
  ...lightDep,
  description: "Light Dep Professional — профессиональный гель с усиленной формулой и Ethoxydiglycol, рассчитанный на более быстрое начало действия и сокращённую экспозицию.",
  usage: "Нанесите средство слоем 1–2 мм на очищенную и обезжиренную неповреждённую кожу, накройте плёнкой и выдержите 15–60 минут. Снимите плёнку и удалите остатки перед процедурой.",
  composition: "Aqua, Anestoderm, Ethoxydiglycol, Carbomer, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide, Parfum.",
  advantages: "Сокращённая экспозиция от 15 минут, усиленная формула, удобная плотная текстура и экономичный расход.",
};

const mildep: Omit<ProductDetails, "sourceUrl"> = {
  description: "Mildep Professional — универсальный крем для применения в косметологии. Формула рассчитана на поддержание комфорта в течение косметической процедуры.",
  usage: "Нанесите крем на целую неповреждённую кожу в два слоя, не дожидаясь высыхания первого, и накройте плёнкой. Выдержите 15–60 минут, затем снимите плёнку и удалите остатки.",
  composition: "Aqua, Frizalgin Complex, Transcutol CG, Carbomer, PEG-40 Hydrogenated Castor Oil, Sodium Hydroxide, Panthenol, Allantoin, Hyaluronic Acid, Parfum, Phenoxyethanol, Ethylhexylglycerin.",
  purpose: "Косметологические и инъекционные процедуры; мезотерапия; контурная пластика; биоревитализация; татуаж, перманентный макияж, татуировки и эпиляция.",
  advantages: "Универсальность для лица и тела, сокращённое время выдержки и формула с пантенолом, аллантоином и гиалуроновой кислотой.",
};

const details: Record<number, ProductDetails> = {
  17: { ...primaryBase, sourceUrl: source("catalog/anestet/gel-dlya-pervichnogo-oxlazhdeniya-base-30-ml") },
  33: { ...primaryBase, sourceUrl: source("catalog/anestet/gel-dlya-pervichnogo-oxlazhdeniya-base-400-ml") },
  34: { ...primaryBase, usage: primaryBase.usage.replace("20–40", "10–30").replace("до 1 часа", "до 40 минут"), purpose: "Перманентный макияж; татуаж; микроблейдинг; удаление татуировок и перманента.", sourceUrl: source("catalog/anestet/gel-dlya-pervichnogo-oxlazhdeniya-detail-30-ml") },
  35: { ...primaryFion, sourceUrl: source("catalog/fion/gel-dlya-pervichnogo-oxlazhdeniya-fion-ultra-30-ml") },
  36: { ...primaryFion, sourceUrl: source("catalog/fion/gel-dlya-pervichnogo-oxlazhdeniya-fion-ultra-400-ml") },
  37: { ...secondaryBase, sourceUrl: source("catalog/anestet/gel-dlya-vtorichnogo-oxlazhdeniya-base-30-ml") },
  38: { ...secondaryBase, sourceUrl: source("catalog/anestet/gel-dlya-vtorichnogo-oxlazhdeniya-base-5-ml") },
  39: { ...secondaryFion, sourceUrl: source("catalog/fion/gel-dlya-vtorichnogo-oxlazhdeniya-fion-ultra-30-ml") },
  40: { ...secondaryFion, sourceUrl: source("catalog/fion/gel-dlya-vtorichnogo-oxlazhdeniya-fion-ultra-5-ml") },
  42: {
    description: "Нежная формула для глубокого увлажнения, восстановления кожного барьера и успокоения чувствительной кожи. Церамиды поддерживают липидный барьер, масла и сквален питают кожу.",
    usage: "Нанесите небольшое количество крема на чистую кожу лёгкими массажными движениями и дождитесь полного впитывания. Подходит для ежедневного применения.",
    composition: "Aqua, Glycerin, Glyceryl Stearate, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Butyrospermum Parkii (Shea Butter) Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Cholesterol, Ceramide AP, Ceramide EOP, Ceramide NP, Phytosphingosine, Sodium Lauroyl Lactylate, Xanthan Gum, Allantoin, Bisabolol, Tocopherol, Beta-Sitosterol, Squalene, Salvia Officinalis Extract, Green Tea Extract, Origanum Vulgare Flower/Leaf/Stem Extract, Phenoxyethanol, Ethylhexylglycerin.",
    purpose: "Ежедневный уход за сухой и чувствительной кожей, поддержка кожного барьера и защита от потери влаги.",
    advantages: "Поддерживает баланс микробиома, быстро впитывается и не оставляет жирной плёнки.",
    sourceUrl: source("catalog/queen-key/repair-cream-with-ceramide-vosstanavlivayushhij-krem-dlya-licza-s-czeramidami-50-ml"),
  },
  48: { ...lightFrost, sourceUrl: source("catalog/lightfrost/gel-dlya-naruzhnogo-primeneniya-light-frost-30-ml") },
  49: { ...lightFrost, sourceUrl: source("catalog/lightfrost/gel-dlya-naruzhnogo-primeneniya-light-frost-150-ml") },
  50: { ...lightFrost, sourceUrl: source("catalog/lightfrost/gel-dlya-naruzhnogo-primeneniya-light-frost-400-ml") },
  51: { ...lightDep, sourceUrl: source("catalog/lightdep/gel-kosmeticheskij-light-dep-dlya-tela-30-ml") },
  52: { ...lightDep, sourceUrl: source("catalog/lightdep/gel-kosmeticheskij-light-dep-dlya-tela-75-ml") },
  53: { ...lightDep, sourceUrl: source("catalog/lightdep/gel-kosmeticheskij-light-dep-dlya-tela-300-ml") },
  54: { ...lightDep, sourceUrl: source("catalog/lightdep/gel-kosmeticheskij-light-dep-dlya-licza-300-ml") },
  55: { ...lightDepPro, sourceUrl: source("catalog/lightdep-professional/gel-kosmeticheskij-light-dep-professional-30-ml") },
  56: { ...lightDepPro, sourceUrl: source("catalog/lightdep-professional/gel-kosmeticheskij-light-dep-professional-300-ml") },
  57: {
    description: "Гель Анестодерм охлаждает и успокаивает кожу, снижая неприятные ощущения во время косметологических и эстетических процедур.",
    usage: "Нанесите гель ватным диском на чистую неповреждённую кожу на 15–20 минут. Для усиления эффекта накройте плёнкой; время можно увеличить до 1 часа. Удалите остатки перед процедурой. В зоне вокруг глаз применять с осторожностью.",
    composition: "Aqua, Anestoderm, Ethoxydiglycol, Glycocid Eco (Hydrolyzed Glycosaminoglycans), Carbomer, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol, Sodium Hydroxide, Ethylhexylpropanediol, Menthol, Disodium EDTA, Parfum.",
    purpose: lightDep.purpose,
    advantages: "Быстрое и продолжительное охлаждение, деликатный уход и плотная экономичная текстура.",
    sourceUrl: source("catalog/anestoderm/gel-kosmeticheskij-anestoderm-300-ml"),
  },
  58: { ...mildep, sourceUrl: source("catalog/mildep-professional/krem-mildep-professional-30-ml") },
  59: { ...mildep, sourceUrl: source("catalog/mildep-professional/krem-mildep-professional-300-ml") },
  60: {
    description: "Восстанавливающие сливки для тела с Д-пантенолом увлажняют, питают и смягчают кожу. Масло ши помогает защищать от потери влаги, бисаболол и аллантоин поддерживают комфорт чувствительной кожи.",
    usage: "Нанесите небольшое количество на предварительно очищенную кожу мягкими массажными движениями и дайте полностью впитаться. Рекомендуется для ежедневного применения.",
    composition: "Aqua, Butyrospermum Parkii Butter, Panthenol, Bisabolol, Allantoin, Chlorhexidine Digluconate, Carbomer, Triethanolamine, Mineral Oil, Parfum, DMDM Hydantoin, Methylchloroisothiazolinone, Methylisothiazolinone.",
    purpose: "Ежедневный восстанавливающий и увлажняющий уход за кожей тела.",
    advantages: "Увлажнение, питание, смягчение и поддержка естественного обновления кожи.",
    sourceUrl: source("catalog/vosstanavlivayushhie-slivki-s-d-pantenolom"),
  },
};

export function getProductDetails(productId: number) {
  return details[productId];
}
