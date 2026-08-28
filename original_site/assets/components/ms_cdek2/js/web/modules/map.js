let Base = await import(`./base.js${window.mscdekConfig.version}`);
Base = Base.Base;

export class Map extends Base {
  init() {
    if (!this.config.initMap) {
      console.log('For load map set API key in system setting ms_cdek2_map_api_key (or switch ms_cdek2_map_provider to "osm")');
      return;
    }

    this.getElements({
      mapBlock: {
        selector: `[${this.config.mapAttr}]`,
        logMessage: 'For load map add in template <div data-mscdek-map class="hide"></div>'
      },
    });

    if (!this.mapBlock) {
      return;
    }

    this.prefixes.push('map');
    const events = {
      onMapInit: `${this.appName}:map:init`,
      onMapShow: `${this.appName}:map:show`,
      onMapHide: `${this.appName}:map:hide`,
      onMarkerChoose: `${this.appName}:map:choose`,
      onMarkerCreate: `${this.appName}:marker:create`,
    };
    this.events = {...this.events, ...events};
    this.autoSelect = true;
    this.mapProvider = this.config.mapProvider || 'osm';
    this.createMarkerTemplate();
    super.init();

    if (this.mapProvider !== 'yandex' && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        if (this.ymap && typeof this.ymap.invalidateSize === 'function' && this.mapBlock.offsetWidth > 0) {
          this.ymap.invalidateSize(false);
        }
      });
      this._resizeObserver.observe(this.mapBlock);
    }
  }

  createMarkerTemplate() {
    this.contentPin = document.createElement('div');
    if (this.config.markerImgParams.src) {
      this.contentPin.innerHTML = `<img width="${this.config.markerImgParams.width}" height="${this.config.markerImgParams.height}" src="${this.config.markerImgParams.src}" />`;
    }
    this.contentPin.classList.add(this.config.markerClass);
  }

  hide() {
    if (!this.mapBlock) return;
    this.mapBlock.classList.add(this.config.hideClass);

    this.helpers.dispatchEvent(this.events.onMapHide, {
      bubbles: true,
      cancelable: false,
      detail: {
        mapBlock: this.mapBlock,
        ymap: this.ymap,
        object: this
      }
    });
  }

  async show(points, coordinates) {
    if (!points.length) return;
    if (!this.mapBlock) return;

    try {
      this.mapBlock.classList.remove(this.config.hideClass);

      if (!this.ymap) {
        await this.initMap();

        this.helpers.dispatchEvent(this.events.onMapInit, {
          bubbles: true,
          cancelable: false,
          detail: {
            mapBlock: this.mapBlock,
            ymap: this.ymap,
            object: this
          }
        });
      }

      if (this.mapProvider !== 'yandex' && this.ymap && typeof this.ymap.invalidateSize === 'function') {
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        this.ymap.invalidateSize(false);
      }

      this.mapUpdParams = {
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 12
      }

      this.helpers.dispatchEvent(this.events.onMapShow, {
        bubbles: true,
        cancelable: false,
        detail: {
          mapUpdParams: this.mapUpdParams,
          mapBlock: this.mapBlock,
          ymap: this.ymap,
          object: this
        }
      });

      this.pointField = document.querySelector(this.config.pointSelector);
      this.moveMapToCoordinates(this.mapUpdParams);
      await this.addClustersOnMap(this.getPVZ(points));

    } catch (error) {
      console.error('Error in show method:', error);
    }
  }

  async initMap() {

    if (this._mapInitializing) {
      await new Promise(resolve => {
        const checkInitialization = () => {
          if (this.ymap) {
            resolve();
          } else {
            setTimeout(checkInitialization, 50);
          }
        };
        checkInitialization();
      });
      return;
    }

    if (this.ymap) return;

    try {
      this._mapInitializing = true;

      if (this.mapProvider === 'yandex') {
        await ymaps3.ready;
        await ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
          '@yandex/ymaps3-default-ui-theme@0.0',
          '@yandex/ymaps3-clusterer@0.0'
        ]);

        const {YMap, YMapDefaultSchemeLayer, YMapControls, YMapLayer, YMapFeatureDataSource} = ymaps3;
        const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-default-ui-theme');

        this.ymap = new YMap(
          this.mapBlock,
          {
            location: {
              center: [37.588144, 55.733842],
              zoom: 12
            },
          }
        );

        const controls = new YMapControls({position: 'right', orientation: 'vertical'});
        controls.addChild(new YMapZoomControl({}));

        this.ymap
          .addChild(new YMapDefaultSchemeLayer())
          .addChild(controls)
          .addChild(new YMapFeatureDataSource({id: this.appName}))
          .addChild(new YMapLayer({source: this.appName, type: 'markers', zIndex: 1800}));
      } else {
        if (this.mapBlock._mscdekLeafletMap) {
          this.ymap = this.mapBlock._mscdekLeafletMap;
        } else {
          if (this.mapBlock._leaflet_id) {
            delete this.mapBlock._leaflet_id;
            this.mapBlock.innerHTML = '';
          }
          this.ymap = L.map(this.mapBlock).setView([55.733842, 37.588144], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(this.ymap);
          this.mapBlock._mscdekLeafletMap = this.ymap;
        }
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    } finally {
      this._mapInitializing = false;
    }
  }

  moveMapToCoordinates() {
    if (!this.ymap) {
      console.warn('Map not initialized');
      return;
    }
    if (this.mapProvider === 'yandex') {
      this.ymap.setLocation(this.mapUpdParams);
    } else {
      const [lng, lat] = this.mapUpdParams.center;
      this.ymap.setView([lat, lng], this.mapUpdParams.zoom);
    }
  }

  async addClustersOnMap(points) {
    if (this.mapProvider === 'yandex') {
      const {YMapClusterer, clusterByGrid} = await ymaps3.import('@yandex/ymaps3-clusterer');
      const clusterer = new YMapClusterer({
        method: clusterByGrid({gridSize: 128}),
        features: points,
        marker: this.marker.bind(this),
        cluster: this.cluster.bind(this)
      });

      this.ymap.addChild(clusterer);
    } else {
      if (this.clusterLayer) {
        this.ymap.removeLayer(this.clusterLayer);
        this.clusterLayer = null;
      }
      this.clusterLayer = L.markerClusterGroup({
        iconCreateFunction: (cluster) => L.divIcon({
          html: this.config.clusterInnerHtml.replace('${count}', cluster.getChildCount()),
          className: this.config.clusterClass,
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        })
      });
      points.forEach(feature => {
        const marker = this.marker(feature);
        if (marker) this.clusterLayer.addLayer(marker);
      });
      this.ymap.addLayer(this.clusterLayer);
    }
  }

  getPVZ(points) {
    return points.map((point, i) => ({
      type: 'Feature',
      id: i,
      geometry: {coordinates: [point.location.longitude, point.location.latitude]},
      properties: point
    }));
  }

  marker(feature) {
    const markerElem = this.contentPin.cloneNode(true);
    markerElem.setAttribute('id', feature.properties.code);

    this.helpers.dispatchEvent(this.events.onMarkerCreate, {
      bubbles: true,
      cancelable: false,
      detail: {
        marker: markerElem,
        markerData: feature,
        object: this
      }
    });

    if (this.mapProvider === 'yandex') {
      return new ymaps3.YMapMarker(
        {
          coordinates: feature.geometry.coordinates,
          source: this.appName,
          onClick: (e) => {
            const allMarkers = document.querySelectorAll(`.${this.config.markerClass}`);

            this.helpers.dispatchEvent(this.events.onMarkerChoose, {
              bubbles: true,
              cancelable: false,
              detail: {
                allMarkers: allMarkers,
                marker: e.target,
                mapBlock: this.mapBlock,
                markerData: feature,
                ymap: this.ymap,
                object: this
              }
            });

            this.autoSelect && this.choosePoint(feature.properties);
            this.markPointOnMap(e.target.closest(`.${this.config.markerClass}`));
            allMarkers.forEach(pin => pin.classList.remove(this.config.chosenClass));
            e.target.closest(`.${this.config.markerClass}`)?.classList.add(this.config.chosenClass);
          }
        },
        markerElem
      );
    }

    const [lng, lat] = feature.geometry.coordinates;
    const lMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: markerElem.innerHTML,
        className: this.config.markerClass,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    });
    lMarker.on('click', (e) => {
      const markerEl = e.target.getElement();
      const allMarkers = document.querySelectorAll(`.${this.config.markerClass}`);

      this.helpers.dispatchEvent(this.events.onMarkerChoose, {
        bubbles: true,
        cancelable: false,
        detail: {
          allMarkers: allMarkers,
          marker: markerEl,
          mapBlock: this.mapBlock,
          markerData: feature,
          ymap: this.ymap,
          object: this
        }
      });

      this.autoSelect && this.choosePoint(feature.properties);
      this.markPointOnMap(markerEl);
      allMarkers.forEach(pin => pin.classList.remove(this.config.chosenClass));
      markerEl?.classList.add(this.config.chosenClass);
    });
    return lMarker;
  }

  choosePoint(pointData) {
    if (this.pointField.tagName === 'SELECT') {
      const option = Array.from(this.pointField.options).find(option => option.dataset[this.config.codeKey] === pointData.code);
      option.selecled = true;
      this.pointField.value = option.value;
    } else {
      this.pointField.value = pointData[this.config.pointValueFieldName] ?? pointData.location[this.config.pointValueFieldName];
    }
    this.pointField.dispatchEvent(new Event('change', {bubbles: true}));
  }

  markPointOnMap(pointElement) {
    document.querySelectorAll(`.${this.config.markerClass}`).forEach(pin => pin.classList.remove(this.config.chosenClass));
    pointElement && pointElement.classList.add(this.config.chosenClass);
  }

  cluster(coordinates, features) {
    return new ymaps3.YMapMarker(
      {
        coordinates,
        source: this.appName
      },
      this.getClusterCircle(features.length).cloneNode(true)
    );
  }

  getClusterCircle(count) {
    const circle = document.createElement('div');
    circle.classList.add(this.config.clusterClass);
    circle.innerHTML = this.config.clusterInnerHtml.replace('${count}', count);
    return circle;
  }
}
