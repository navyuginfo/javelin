/**
 * @requires javelin-install
 *           javelin-event
 * @provides javelin-vector
 *
 * @javelin-installs JX.$V
 *
 * @javelin
 */

/**
 * Handy convenience function that returns a JX.Vector instance so you can
 * concisely write something like:
 *
 *  JX.$V(x, y).add(10, 10);
 * or
 *  JX.$V(node).add(50, 50).setDim(node);
 */
JX.$V = function(x, y) {
  return new JX.Vector(x, y);
};

/**
 * Query and update positions and dimensions of nodes (and other things) within
 * within a document. Each vector has two elements, 'x' and 'y', which usually
 * represent width/height ('dimension vector') or left/top ('position vector').
 *
 * Vectors are used to manage the sizes and positions of elements, events,
 * the document, and the viewport (the visible section of the document, i.e.
 * how much of the page the user can actually see in their browser window).
 * Unlike most Javelin classes, @{JX.Vector} exposes two bare properties,
 * 'x' and 'y'. You can read and manipulate these directly:
 *
 *   // Give the user information about elements when they click on them.
 *   JX.Stratcom.listen(
 *     'click',
 *     null,
 *     function(e) {
 *       var p = new JX.Vector(e);
 *       var d = JX.Vector.getDim(e.getTarget());
 *
 *       alert('You clicked at <' + p.x + ',' + p.y + '> and the element ' +
 *             'you clicked is ' + d.x + 'px wide and ' + d.y + 'px high.');
 *     });
 *
 * You can also update positions and dimensions using vectors:
 *
 *   // When the user clicks on something, make it 10px wider and 10px taller.
 *   JX.Stratcom.listen(
 *     'click',
 *     null,
 *     function(e) {
 *       var target = e.getTarget();
 *       JX.$V(target).add(10, 10).setDim(target);
 *     });
 *
 * Additionally, vectors can be used to query document and viewport information:
 *
 *   var v = JX.Vector.getViewport(); // Viewport (window) width and height.
 *   var d = JX.Vector.getDocument(); // Document width and height.
 *   var visible_area = parseInt(100 * (v.x * v.y) / (d.x * d.y), 10);
 *   alert('You can currently see ' + visible_area + ' % of the document.');
 *
 * @author epriestley
 *
 * @task query  Querying Positions and Dimensions
 * @task update Changing Positions and Dimensions
 * @task manip  Manipulating Vectors
 */
JX.install('Vector', {

  /**
   * Construct a vector, either from explicit coordinates or from a node
   * or event. You can pass two Numbers to construct an explicit vector:
   *
   *   var p = new JX.Vector(35, 42);
   *
   * Otherwise, you can pass a @{JX.Event} or a Node to implicitly construct a
   * vector:
   *
   *   var q = new JX.Vector(some_event);
   *   var r = new JX.Vector(some_node);
   *
   * These are just like calling JX.Vector.getPos() on the @{JX.Event} or Node.
   *
   * For convenience, @{JX.$V()} constructs a new vector so you don't need to
   * use the 'new' keyword. That is, these are equivalent:
   *
   *   var s = new JX.Vector(x, y);
   *   var t = JX.$V(x, y);
   *
   * Methods like getScroll(), getViewport() and getDocument() also create
   * new vectors.
   *
   * Once you have a vector, you can manipulate it with add():
   *
   *   var u = JX.$V(35, 42);
   *   var v = u.add(5, -12); // v = <40, 30>
   *
   * @param wild      'x' component of the vector, or a @{JX.Event}, or a Node.
   * @param Number?   If providing an 'x' component, the 'y' component of the
   *                  vector.
   * @return @{JX.Vector} Specified vector.
   * @task query
   */
  construct : function(x, y) {
    if (typeof y == 'undefined') {
      return JX.Vector.getPos(x);
    }

    this.x = parseFloat(x);
    this.y = parseFloat(y);
  },

  members : {
    x : null,
    y : null,

    /**
     * Move a node around by setting the position of a Node to the vector's
     * coordinates. For instance, if you want to move an element to the top left
     * corner of the document, you could do this (assuming it has 'position:
     * absolute'):
     *
     *   JX.$V(0, 0).setPos(node);
     *
     * @param Node Node to move.
     * @return this
     * @task update
     */
    setPos : function(node) {
      node.style.left = (this.x === null) ? '' : (parseInt(this.x, 10) + 'px');
      node.style.top  = (this.y === null) ? '' : (parseInt(this.y, 10) + 'px');
      return this;
    },

    /**
     * Change the size of a node by setting its dimensions to the vector's
     * coordinates. For instance, if you want to change an element to be 100px
     * by 100px:
     *
     *   JX.$V(100, 100).setDim(node);
     *
     * Or if you want to expand a node's dimensions by 50px:
     *
     *   JX.$V(node).add(50, 50).setDim(node);
     *
     * @param Node Node to resize.
     * @return this
     * @task update
     */
    setDim : function(node) {
      node.style.width =
        (this.x === null)
          ? ''
          : (parseInt(this.x, 10) + 'px');
      node.style.height =
        (this.y === null)
          ? ''
          : (parseInt(this.y, 10) + 'px');
      return this;
    },

    /**
     * Change a vector's x and y coordinates by adding numbers to them, or
     * adding the coordinates of another vector. For example:
     *
     *   var u = JX.$V(3, 4).add(100, 200); // u = <103, 204>
     *
     * You can also add another vector:
     *
     *   var q = JX.$V(777, 999);
     *   var r = JX.$V(1000, 2000);
     *   var s = q.add(r); // s = <1777, 2999>
     *
     * Note that this method returns a new vector. It does not modify the
     * 'this' vector.
     *
     * @param wild      Value to add to the vector's x component, or another
     *                  vector.
     * @param Number?   Value to add to the vector's y component.
     * @return @{JX.Vector} New vector, with summed components.
     * @task manip
     */
    add : function(x, y) {
      if (x instanceof JX.Vector) {
        y = x.y;
        x = x.x;
      }
      return new JX.Vector(this.x + parseFloat(x), this.y + parseFloat(y));
    }
  },

  statics : {
    _viewport: null,

    /**
     * Determine where in a document an element is (or where an event, like
     * a click, occurred) by building a new vector containing the position of a
     * Node or @{JX.Event}. The 'x' component of the vector will correspond to
     * the pixel offset of the argument relative to the left edge of the
     * document, and the 'y' component will correspond to the pixel offset of
     * the argument relative to the top edge of the document. Note that all
     * vectors are generated in document coordinates, so the scroll position
     * does not affect them.
     *
     * See also getDim(), used to determine an element's dimensions.
     *
     * @param  Node|@{JX.Event}  Node or event to determine the position of.
     * @return @{JX.Vector}      New vector with the argument's position.
     * @task query
     */
    getPos : function(node) {
      JX.Event && (node instanceof JX.Event) && (node = node.getRawEvent());

      if (('pageX' in node) || ('clientX' in node)) {
        var c = JX.Vector._viewport;
        return new JX.Vector(
          node.pageX || (node.clientX + c.scrollLeft),
          node.pageY || (node.clientY + c.scrollTop));
      }

      var x = node.offsetLeft;
      var y = node.offsetTop;
      while (node.offsetParent && (node.offsetParent != document.body)) {
        node = node.offsetParent;
        x += node.offsetLeft;
        y += node.offsetTop;
      }

      return new JX.Vector(x, y);
    },

    /**
     * Determine the width and height of a node by building a new vector with
     * dimension information. The 'x' component of the vector will correspond
     * to the element's width in pixels, and the 'y' component will correspond
     * to its height in pixels.
     *
     * See also getPos(), used to determine an element's position.
     *
     * @param  Node      Node to determine the display size of.
     * @return @{JX.$V}  New vector with the node's dimensions.
     * @task query
     */
    getDim : function(node) {
      return new JX.Vector(node.offsetWidth, node.offsetHeight);
    },

    /**
     * Determine the current scroll position by building a new vector where
     * the 'x' component corresponds to how many pixels the user has scrolled
     * from the left edge of the document, and the 'y' component corresponds to
     * how many pixels the user has scrolled from the top edge of the document.
     *
     * See also getViewport(), used to determine the size of the viewport.
     *
     * @return @{JX.$V}  New vector with the document scroll position.
     * @task query
     */
    getScroll : function() {
      // We can't use JX.Vector._viewport here because there's diversity between
      // browsers with respect to where position/dimension and scroll position
      // information is stored.
      var b = document.body;
      var e = document.documentElement;
      var w = window;
      return new JX.Vector(
        w.pageXOffset || b.scrollLeft || e.scrollLeft,
        w.pageYOffset || b.scrollTop || e.scrollTop
      );
    },

    /**
     * Determine the size of the viewport (basically, the browser window) by
     * building a new vector where the 'x' component corresponds to the width
     * of the viewport in pixels and the 'y' component corresponds to the height
     * of the viewport in pixels.
     *
     * See also getScroll(), used to determine the position of the viewport, and
     * getDocument(), used to determine the size of the entire document.
     *
     * @return @{JX.$V}  New vector with the viewport dimensions.
     * @task query
     */
    getViewport : function() {
      var c = JX.Vector._viewport;
      var w = window;

      return new JX.Vector(
        w.innerWidth || c.clientWidth || 0,
        w.innerHeight || c.clientHeight || 0
      );
    },

    /**
     * Determine the size of the document, including any area outside the
     * current viewport which the user would need to scroll in order to see, by
     * building a new vector where the 'x' component corresponds to the document
     * width in pixels and the 'y' component corresponds to the document height
     * in pixels.
     *
     * @return @{JX.$V} New vector with the document dimensions.
     * @task query
     */
    getDocument : function() {
      var c = JX.Vector._viewport;
      return new JX.Vector(c.scrollWidth || 0, c.scrollHeight || 0);
    }
  },

  /**
   * On initialization, the browser-dependent viewport root is determined and
   * stored.
   *
   * In ##__DEV__##, @{JX.$V} installs a toString() method so vectors print in a
   * debuggable way:
   *
   *   <23, 92>
   *
   * @return void
   */
  initialize : function() {
    var c = ((c = document) && (c = c.documentElement)) ||
            ((c = document) && (c = c.body));
    JX.Vector._viewport = c;

    if (__DEV__) {
      JX.Vector.prototype.toString = function() {
        return '<' + this.x + ', ' + this.y + '>';
      };
    }
  }

});
