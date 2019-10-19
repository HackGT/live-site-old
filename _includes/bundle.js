<script>
    var MapGT = (function(e) {
  var t = {};
  function i(n) {
    if (t[n]) return t[n].exports;
    var r = (t[n] = { i: n, l: !1, exports: {} });
    return e[n].call(r.exports, r, r.exports, i), (r.l = !0), r.exports;
  }
  return (
    (i.m = e),
    (i.c = t),
    (i.d = function(e, t, n) {
      i.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
    }),
    (i.r = function(e) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (i.t = function(e, t) {
      if ((1 & t && (e = i(e)), 8 & t)) return e;
      if (4 & t && "object" == typeof e && e && e.__esModule) return e;
      var n = Object.create(null);
      if (
        (i.r(n),
        Object.defineProperty(n, "default", { enumerable: !0, value: e }),
        2 & t && "string" != typeof e)
      )
        for (var r in e)
          i.d(
            n,
            r,
            function(t) {
              return e[t];
            }.bind(null, r)
          );
      return n;
    }),
    (i.n = function(e) {
      var t =
        e && e.__esModule
          ? function() {
              return e.default;
            }
          : function() {
              return e;
            };
      return i.d(t, "a", t), t;
    }),
    (i.o = function(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (i.p = ""),
    i((i.s = 0))
  );
})([
  function(e, t, i) {
    const n = i(1).default;
    e.exports = n;
  },
  function(e, t, i) {
    "use strict";
    i.r(t);
    class n {
      constructor(e, t) {
        (this.areaDOMGroup = e), (this.id = t), (this.eventListeners = []);
      }
      addEventListener(e) {
        this.areaDOMGroup.addEventListener(e.type, e.callBack);
      }
      highlight(e) {
        this.areaDOMGroup.querySelector("path").setAttributeNS(null, "fill", e);
      }
      unhighlight() {
        this.areaDOMGroup
          .querySelector("path")
          .setAttributeNS(null, "fill", "transparent");
      }
    }
    class r {
      constructor(e) {
        (this._viewDOMGroup = e),
          (this.id = this._viewDOMGroup.attributes.id.nodeValue),
          (this.areas = []),
          this._populateAreas();
      }
      getArea(e) {
        return this._mapDOM.getElementById(e);
      }
      _populateAreas() {
        const e = this._viewDOMGroup.querySelectorAll(".area");
        for (let t of e) this.areas.push(new n(t));
      }
    }
    i.d(t, "default", function() {
      return s;
    });
    class s {
      constructor(e, t = "map") {
        (this._filePath = e),
          (this._parentContainerID = t),
          (this._parentContainer = document.getElementById(
            this._parentContainerID
          )),
          this._parentContainer ||
            console.error(
              `parent container with id ${this._parentContainerID} could not be found.`
            ),
          (this._mapObjectTag = this._createMap(this._filePath)),
          (this._appendedToDOM = !1),
          this.showMap(),
          (this._mapObjectTag.onload = e => {
            (this._mapDOM = e.target.contentDocument),
              this._mapDOM
                ? ((this.views = []),
                  (this.areas = []),
                  this._populateViews(),
                  (this.currentView = Array.from(
                    this._mapDOM.querySelectorAll(".view")
                  ).filter(
                    e => "visible" == e.attributes.visibility.nodeValue
                  )[0]),
                  this.addViewSwitcher(),
                  this.setActiveView("view0"))
                : console.warn(
                    "contentDocument of the SVG is null and SVG DOM manipulation will not be possible. Try setting up a simple server to by pass the CORS issue.\n    Suggested solution for dev: python -m http.server"
                  );
          });
      }
      showMap() {
        this._appendedToDOM
          ? console.warn("Map has already been appended to the DOM")
          : (this._parentContainer.appendChild(this._mapObjectTag),
            (this._appendedToDOM = !0));
      }
      setDefaultPin(e) {
        this.pinImagePath = e;
      }
      _createMap(e) {
        let t = document.createElement("object");
        return (
          t.setAttribute("data", e), t.setAttribute("type", "image/svg+xml"), t
        );
      }
      _populateViews() {
        Array.from(this._mapDOM.querySelectorAll(".view")).map(e => {
          this.views.push(new r(e));
        });
      }
      setActiveView(e) {
        const t = this._mapDOM.getElementById(e);
        t &&
          (this.currentView.setAttributeNS(null, "visibility", "hidden"),
          (this.currentView = t),
          this.currentView.setAttributeNS(null, "visibility", "visible"),
          (document.getElementById(e + "switcher").checked = !0));
      }
      popupAt(e, t, i = {}) {
        const n = document.createElement("div");
        (n.style.top = `${e}px`),
          (n.style.left = `${t}px`),
          n.classList.add("card"),
          n.appendChild(this._createTitleDiv()),
          document.body.appendChild(n);
      }
      findCenter(e) {
        return new Promise(
          function(t, i) {
            console.log("i'm hrere"),
              console.log(this),
              setTimeout(
                function() {
                  if (null != this._mapDOM) {
                    const i = this._mapDOM.getElementById(e).getBBox(),
                      n = this._parentContainer.offsetLeft,
                      r = this._parentContainer.offsetTop,
                      s = i.x + i.width / 4,
                      a = i.y + i.height / 4;
                    t([s + n, a + r]);
                  }
                }.bind(this),
                300
              );
          }.bind(this)
        );
      }
      dropPinAt(e, t) {
        const i = document.createElement("div"),
          n = document.createElement("img");
        (n.src = this.pinImagePath),
          (n.style.width = "50px"),
          (i.style.position = "absolute"),
          (i.style.left = `${e}px`),
          (i.style.top = `${t}px`),
          i.classList.add("pin"),
          i.appendChild(n),
          document.body.appendChild(i);
      }
      _createTitleDiv() {
        const e = document.createElement("div");
        return (
          e.classList.add("card-title"), e.setAttribute("id", "event-name"), e
        );
      }
      _createCardPointerDiv() {
        const e = document.createElement("div");
        return e.classList.add("card-pointer"), e;
      }
      addViewSwitcher() {
        console.log("adding view switcher");
        const e = document.createElement("div");
        e.classList.add("view-switcher");
        for (let t = 0; t < this.views.length; t++) {
          const i = document.createElement("div"),
            n = document.createElement("input"),
            r = document.createElement("label");
          n.setAttribute("id", this.views[t].id + "switcher"),
            n.setAttribute("type", "radio"),
            n.setAttribute("name", "view"),
            n.addEventListener("change", e => {
              e.target.checked && this.setActiveView(this.views[t].id);
            }),
            r.setAttribute("for", this.views[t].id + "switcher"),
            (r.innerHTML = `${t + 1}`),
            i.classList.add("view-switcher-option"),
            i.appendChild(n),
            i.appendChild(r),
            e.appendChild(i);
        }
        this._parentContainer.appendChild(e);
      }
    }
  }
]);

</script>
