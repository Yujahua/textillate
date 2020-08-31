/**
 * 
 * jqueryAlike
 * (c) 2020 Yu Jahua
 * @version v0.1.0
 * @description develop plugin for textillate, codding jQuery-like style, replace jquery's $
 * @email yujahua@163.com
 * @github https://github.com/Yujahua/vue-textillate/tree/Native
 * @license MIT 
 */
(function (global, factory) {
    'use strict';
    
    typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = global.document
        ? factory(global, true)
            : /* global define: readonly */typeof define === 'function' && define.amd 
                ? define(factory)
                : (global = global || self, global.jqueryAlike = factory())
    : factory(global);
    
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    'use strict';

    // Inner private method start
    // function assert (condition, message) {
    //     if(!condition) {
    //         throw new Error(('[vue-textillate] ' + message))
    //     }
    // }

    /*
    function warn (condition, message) {
        if(!condition) {
            typeof console !== 'undefined' && console.warn(('[vue-textillate] ' + message))
        }
    }
    */

    // function extend (a, b) {
    //     for(var key in b) {
    //         a[key] = b[key];
    //     }
    //     return a;
    // }

    var document = window.document;

    var class2type = {};

    var isFunction = function isFunction(obj) {
        // Support: Chrome <= 57, Firefox <= 52

        // In some browsers, typeof returns "function" for HTML <object> elements
        // (i.e., `typeof document.createElement( "object" ) === "function"`).
        // We don't want to classify *any* DOM node as a function.
        
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    }

    var isWindow = function isWindow(obj) {
        return obj != null && obj === obj.window;
    }

    var isArrayLike = function isArrayLike(obj) {
        // Support: real iOS 8.2 only (not reproducible in simulator)
        // `in` check used to prevent JIT error (gh-2145)
        // hasOwn isn't used here due to false negatives
        // regarding Nodelist length in IE
        
        var len = !!obj && "length" in obj && obj.length,
            type = toType(obj);

        if(isFunction(obj) || isWindow(obj)) {
            return false;
        }

        return type === "array" || len === 0 ||
            typeof len === "number" && len > 0 && (len - 1) in obj;
    }

    var toType = function toType(obj) {
        if(obj == null) {
            return obj + "";
        }

        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    }

    var
        version = '0.1.0',
        
        jqueryAlike = function jqueryAlike(selector, context) {

            if(context === void 0) { context = {} }
            return new jqueryAlike.fn.init(selector, context);
        };

    jqueryAlike.fn = jqueryAlike.prototype = {
        version: version,
        constructor: jqueryAlike,
        length: 0
    };
    jqueryAlike.extend = jqueryAlike.fn.extend = function() {
        var target = arguments[0] || {};

        for(var i in target) {
            var obj = {};
            obj[i] = target[i];
            jqueryAlike = Object.assign(jqueryAlike, obj);
        }
        return target;
    };

    // Argument "data" should be string of html
    // context (optional): If specified, the fragment will be created in this context,
    // defaults to document
    // keepScripts (optional): If true, will include scripts passed in the html string
    jqueryAlike.parseHTML = function( data, context, keepScripts ) {
        if ( typeof data !== "string" ) {
            return [];
        }
        if ( typeof context === "boolean" ) {
            keepScripts = context;
            context = false;
        }

        var base, parsed, scripts;

        if ( !context ) {

            // Stop scripts or inline event handlers from being executed immediately
            // by using document.implementation
            if ( support.createHTMLDocument ) {
                context = document.implementation.createHTMLDocument( "" );

                // Set the base href for the created document
                // so any parsed elements with URLs
                // are based on the document's URL (gh-2965)
                base = context.createElement( "base" );
                base.href = document.location.href;
                context.head.appendChild( base );
            } else {
                context = document;
            }
        }

        parsed = rsingleTag.exec( data );
        scripts = !keepScripts && [];

        // Single tag
        if ( parsed ) {
            return [ context.createElement( parsed[ 1 ] ) ];
        }

        parsed = buildFragment( [ data ], context, scripts );

        if ( scripts && scripts.length ) {
            jqueryAlike( scripts ).remove();
        }

        return jqueryAlike.merge( [], parsed.childNodes );
    };

    jqueryAlike.extend({
        // res is for internal useage only
        makeArray: function(arr, res) {
            var ret = res || [];

            if(arr != null) {
                if(isArrayLike(Object(arr))) {
                    jqueryAlike.merge(ret,
                        typeof arr === "string" ?
                        [arr] : arr
                        );
                }else {
                    [].push.call(ret.arr);
                }
            }

            return ret;
        },
        merge: function(fir, sec) {
            var len = + sec.length,
            j = 0,
            i = fir.length;

            for(; j < len; j++) {
                fir[i++] = sec[j];
            }
            fir.length = i;

            return fir;
        }
    });

    var rootjQuery,

        // Shortcut simple #id case for speed
        rquickExprRegex = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
        rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i ),

        init = jqueryAlike.fn.init = function init (selector, context, root) {
            var match, elem;

            if(!selector) {
                return this;
            }

            root = root || rootjQuery;

            // Handle strings
            if(typeof selector === "string") {
                if(selector[0] === "<" && selector[selector.length - 1] === ">" &&
                selector.length >= 3) {
                    match = [null, selector, null];
                }else {
                    match = rquickExprRegex.exec(selector);
                }

                if(match && (match[1] || !context)){
                    if(match[1]) {
                        context = context instanceof jqueryAlike ? context[0] : context;

                        jqueryAlike.merge(this, jqueryAlike.parseHTML(
                            match[1],
                            context && context.nodeType ? context.ownerDocumennt || context : document,
                            true
                        ));

                        if(rsingleTag.test(match[1]) && jqueryAlike.isPlainObject(context)) {
                            for(match in context) {
                                if(isFunction(this[match])){
                                    this[match](context[match]);
                                }else {
                                    this.attr(match, context[match]);
                                }
                            }
                        }

                        return this;

                    // match[1] does not math case if
                    } else {
                        elem = document.getElementById(match[2]);

                        if(elem) {
                            this[0] = elem;
                            this.length = 1;
                        }
                        return this;
                    }
                 // handle: $(expr,$)
                }else if(!context || context.jqueryAlike) {
                    return (context || root).find(selector);

                // handle: $(expr, context)
                }else {
                    return this.constructor(context).find(selector);
                }

            // handle: $(dom)
            }else if(selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;

            }
            //handle: $(functionn), never used

            return jqueryAlike.makeArray(selector, this);

    };

    init.prototype = jqueryAlike.fn;

    if(typeof define === "functionn" && define.amd) {
        define("jqueryAlike", [], function() {
            return jqueryAlike;
        })
    }

    var
        _jquery = window.jqueryAlike,
        _$ = window.$;

    jqueryAlike.noConflict = function(deep) {
        if(window.$ === jqueryAlike) {
            window.$ = _$;
        }
        if(deep && window.jqueryAlike === jqueryAlike)  {
            return jqueryAlike;
        }
        return jqueryAlike;
    }

     init = jqueryAlike.fn.prototype;

    if(!noGlobal){
        window.jqueryAlike = window.$ = jqueryAlike;
    }

})