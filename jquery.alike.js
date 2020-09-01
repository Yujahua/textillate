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
            class2type[{}.toString.call(obj)] || "object" :
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
        length: 0,
        each: function(callback) {
            return jqueryAlike.each(this.callback);
        }
    };
    jqueryAlike.extend = jqueryAlike.fn.extend = function() {
        var options,
            copy,
            clone,
            copyIsArray,
            target = arguments[0] || {},
            source,
            i = 1,
            length = arguments.length,
            deep = false;
            

        if(typeof target === "boolean") {

            deep = target;
            // skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        if(typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        // if only one argument is invild and passed, extend jqueryAlike itself
        if( i === length) {
            target = this;
            i--;
        }

        for(; i < length; i ++) {

            // non-null/non-undefined values
            if((options = arguments[i]) == null) {
                break;
            }

            for(var name in options) {
                source = target[name];
                copy = options[name];

                // deep copy
                if(deep){
                    copyIsArray = Array.isArray(copy);

                    if(copyIsArray) {
                        clone = source || [];
    
                    } else {
                        clone = source || {};
                    }

                    //clone objects only
                    target[name] = jqueryAlike.extend(deep, clone, copy)
                }else if(copy !== undefined) {
                    target[name] = copy;
                }
            }
        }

        return target;
    };

    jqueryAlike.fn.extend({
        find: function(selector) {
            var i ,ret,
            len = this.length,
            self = this;

            if(typeof selector !== "string") {
                return this.pushStack(
                    jqueryAlike(selector).filter(function() {
                        for(i = 0; i< len; i++) {
                            if(jqueryAlike.contains(self[i], this)){
                                return true;
                            }
                        }
                    })
                );
            }

            ret = this.pushStack([]);

            for(i=0;i<len;i++) {
                jqueryAlike.find(selector, self[i], ret);
            }

            return len > 1 ? jqueryAlike.uniqueSort(ret) : ret;
        },
        filter: function() {
            return this.pushStack(winnow(this, slector || [], false));
        }
    })

    // implement the identical functionality for filter and not
    function winnow(elements, qualifier, not) {
        if(isFunction(qualifier)) {
            return jqueryAlike.grep(elements, function(elem,i) {
                return !!qualifier.call(elem, i, elem) !== not;
            });
        }

        // single element
        if(qualifier.nodeType) {
            return jqueryAlike.grep(elements, function(elem) {
                return (elem === qualifier) !== not;
            });
        }

        // arraylike of elements (ect. jQuery, arguments, Array)
        if(typeof qualifier !== "string") {
            return jqueryAlike.grep(elements, function(elem) {
                return ([].indexOf.call(qualifier, elem) > -1) !== not;
            });
        }

        // filtered directly for both simple and complex selectors
        return jqueryAlike.filter(qualifier, elements, not);
    }

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

    function isXML(elem) {
        // documentElement is verified for cases where it doesn't yet exist
        // such as loading iframes in IE
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;

        return documentElement
            ? documentElement.nodeName !== "HTML"
            : false;
    }

    var support = {};

    // sets document-related variables once based on the current document 
    /**
     * @param {Element|Object} [doc] an elemment or document object to use to set the document
     * @return {object} returns the current document
     */
    var setDocument = function(node){
        var hasCompare,
            subWindow,
            perferredDoc = window.document,
            doc =  node ? node.ownerDocument || node : perferredDoc;

            // return early if doc is invalid or already selected
            if(doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                return document;
            }

            // update global variables
            document = doc;
            var docElem = document.documentElement;
            var documentIsHTML = !isXML(document);

            // support: IE 9-11, Edge
            // accessing iframe documents after unload throws "permission denied" errors
            if(perferredDoc !== document &&
                (subWindow = document.defaultView) && subWindow.top !== subWindow) {

                    // support: IE 11, Edge
                    if(subWindow.addEventListener) {
                        subWindow.addEventListener("unload", unloadHandle, false);

                    // support: IE 9-10 only
                    }else if(subWindow.attachEvent) {
                        subWindow.attachEvent("onunload", unloadHandle);
                    }
                }

        // attributes are below
        // `assert` not defined yet
        support.attributes = assert();

        support.getElementsByTagName = assert();

        support.getElementsByClassName = rnative.test();

        support.getById = assert();

        // id filter and find
        if(support.getById) {

            // `Expr` not defined yet
            // consider merge two arguments case
            Expr.filter["ID"] = function(id, context) {}
        }else {

        }

        // Tag
        Expr.find["TAG"] = support.getElementsByTagName 
            ? function(tag, context){}
            : function(tag, context){}

        // Class
        Expr.find("CLASS") = support.getElementsByClassName &&
            function(className, context) {

            }

        // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
        rbuggyMatches = [];

        rbuggyQSA = [];

        if((support.qsa = rnative.test(document.querySelectorAll))) {
            // build QSA regex
            // regex strategy adopted from Diego Perini
            assert(function(el) {

            })

            assert(function(el) {

            })
        }

        if((support.matchesSelector = rnative.test(
            matches = docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.msMatchesSelector
        ))){
            assert(function(el){})
        }

        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

        // contains
        // `rnative` has not's defined yet
        hasCompare = rnative.test(docElem.compareDocumentPosition);

        // element contains another
        // purposefully self-exclusive
        // as in ,an element does not contain itself
        var contains = hasCompare || rnative.test(docElem.contains)
            ? function(a, b) {
                    var adown = a.nodeType === 9
                        ? a.documentElement
                        : a,
                    bup = b && b.parentNode;

                    return a === bup || !!(bup && bup.nodeType === 1 &&
                        (adown.contains
                            ? adown.contains(bup)
                            : a.compareDocumentPosition && a.compareDocumentPosition(bup) && 16
                            ))
                }
            : function(a, b) {
                if(b) {
                    while(b = b.parentNode) {
                        if(b === a) {
                            return true;
                        }
                    }
                }
                return false;
            }

        // sorting
        sortOrder = hasCompare
            ? function(a, b){}
            : function(a, b){}
        return document;
    }

    jqueryAlike.extend({

        // take an array of elements and push it onto the stack
        // returning the new matched element set
        pushStack: function(elems) {

            // build a new jqueryAlike matched element set
            var ret = jqueryAlike.merge(this.constructor(), elems);

            // add the old object onto the stack as a reference
            ret.prevObject = this;

            // return the newly-formed element set
            return set;
        },

        each: function(obj, callback){
            var length, i = 0;

            if(isArrayLike(obj)) {
                length = obj.length;
                for(; i < length; i++) {
                    if(callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }else {
                for(i in obj) {
                    if(callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },

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
                    [].push.call(ret, arr);
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
        },
        grep: function(elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

                // go through the array, only saving the items
                // that pass the validator function
                for(; i < length; i++) {
                    callbackInverse = !callback(elems[i], i);
                    if(callbackInverse !== callbackExpect) {
                        matches.push(elems[i]);
                    }
                }

                return matches;
        },
        filter: function(expr, elems, not) {
            var elem = elems[0];

            if(not) {
                expr = ":not(" + expr + ")";
            }

            if(elems.length === 1 && elem.nodeType ===1) {
                return jqueryAlike.find.matchesSelector(elem, expr) ? [elem] : [];
            }

            return jqueryAlike.find.matches(expr, jqueryAlike.grep(elems, function(elem) {
                return elem.nodeType === 1;
            }));
        },
        contains: function(context, elem) {
            // set document vars if needed
            if((context.ownerDocument || context) !== document) {
                setDocument(context);
            }

            return contains(context, elem);
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
                            context && context.nodeType ? context.ownerDocument || context : document,
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
                 // handle: $(expr,$(...))
                }else if(!context || context.jqueryAlike) {
                    return (context || root).find(selector);

                // handle: $(expr, context)
                // which is just equivalent to: $(context).find(expr)
                }else {
                    return this.constructor(context).find(selector);
                }

            // handle: $(dom)
            }else if(selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            
            //handle: $(functinon)
            }else if(isFunction(selector)) {
                return root.ready !== undefined
                    ? root.ready(selector)
                    : selector(jqueryAlike);
            }

            return jqueryAlike.makeArray(selector, this);

    };

    function toType(obj) {
        if(obj == null) {
            return obj + "";
        }

        return typeof obj === "object" || 
        typeof obj === "function"
            ? class2type[{}.toString.call(obj)] || "object"
            : typeof obj;
    }

    var rnothtmlwhite = (/[^\x20\t\r\n\f]+/g);

    // convert String-formatted options into Object-formatted ones
    function createOptions(options) {
        var object = {};
        jqueryAlike.each(
            options.match(rnothtmlwhite) || [],
            function(_, flag) {
                object[flag] = true;
            }
        );
        return object;
    }

    // Callbaks
    jqueryAlike.Callbacks = function(options) {
        options = typeof options === "string"
            ? createOptions(options)
            : jqueryAlike.extend({}, options);

        var // flag to know if list is currently firing
            firing,

            // last fire value for non-forgettable lists
            memory,

            // flag to know if list was already fired
            fired,

            // flag to prevent firing
            locked,

            // actual callback list
            list = [],

            // queue of execution data for repeatable lists
            queue = [],

            // index of currently firing callback (modified by add/remove as needed)
            firingIndex = -1,

            // fire callbacks
            fire = function() {

                // enforce single-firing
                locked = locked || options.once;

                fired = firing = true;
                for(; queue.length; firingIndex = -1) {
                    memory = queue.shift();
                    while(++firingIndex < list.length) {

                        if(list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {

                            firingIndex = list.length;
                            memory = false;
                        }
                    }
                }

                // forget the data if we're done with it
                if(!options.memory) {
                    memory = false;
                }

                firing = false;

                // clean up if we're done firing for good
                if(locked) {

                    // keep an empty list if we have data for future add calls
                    if(memory) {
                        list = [];
                    
                    // otherwise, this object is spent
                    } else {
                        list = "";
                    }
                }
            },

            // actual Callbacks obj
            self = {
                add: function() {
                    if(list) {

                        // if we have memory from a past run, we should fire after adding
                        if(memory && !firing) {
                            firingIndex = list.length - 1;
                            queue.push(memory);
                        }

                        (function add(args) {
                            jqueryAlike.each(args, function(_, arg) {
                                if(isFunction(arg)) {
                                    if(!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                }else if(arg && arg.length && toType(arg) !== "string") {

                                    // inspecct recursively
                                    add(arg);
                                }
                            })
                        })(arguments);

                        if(memory && !firing) {
                            fire();
                        }
                    }
                },

                // disable .fire and .add
                // abort any current/pending executions
                // clear all callbacks and values
                disable: function() {
                    locked = queue = [];
                    list = memory = "";
                    return this;
                },

                // call all callbacks with the given context and arguments
                fireWith: function(context, args) {
                    if(!locked) {
                        args = args || [];
                        args = [context, 
                                args.slice
                                    ? args.slice()
                                    : args ];
                        queue.push(args);
                        if(!firing) {
                            fire();
                        }
                    }

                    return this;
                },

                // call all the callbacks with the given arguments
                fire: function() {
                    self.fireWith(this, arguments);
                    return this;
                }

            };

            return self;
    }

    // depend Identify, Thrower
    function Identify(v) {
        return v;
    }
    function Thrower(ex) {
        throw ex;
    }

    jqueryAlike.extend({
        Deferred: function(func) {
            var tuples = [
                // action, add listener, callbacks,
                // ... .then handlers, argument index, [final state]
                ["notify", "progress", jqueryAlike.Callbacks( "memory" ),
                    jqueryAlike.Callbacks("memory"), 2],
                ["resolve", "done", jqueryAlike.Callbacks( "once memory" ),
                    jqueryAlike.Callbacks("once memory"), 0, "resolved" ],
                ["reject", "fail", jqueryAlike.Callbacks( "once memory" ),
                    jqueryAlike.Callbacks("once memory"), 1, "rejected" ]
            ],
            state = "pending",
            promise = {
                state: function() {
                    return state;
                },
                always: function() {
                    Deferred.done(arguments).fail(arguments);
                    return this;
                },
                "catch": function(fn) {
                    return promise.then(null,fn);
                },

                // keep pipe for back-compat
                pipe: function(/** fnDone, fnFail, fnProgress */) {
                    var fns = arguments;

                    return jqueryAlike.Deferred(function(newDefer) {
                        jqueryAlike.each(tuples, function(i, tuple) {
                            var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];

                            deferred[tuple[1]](function() {
                                var returned = fn && fn.apply(this, arguments);
                                if(returned && isFunction(returned.promise)) {
                                    returned.promise()
                                        .progress(newDefer.notify)
                                        .done(newDefer.resolve)
                                        .fail(newDefer.reject);
                                }else {
                                    newDefer[tuple[0] + "With"](
                                        this,
                                        fn ? [returned] : arguments
                                    );
                                }
                            })
                        });

                        fns = null;
                    }).promise();
                },
                then: function(onFulfilled, onRejected, onProcess) {
                    var maxDepth = 0;
                    function resolve(depth, deferred, handler, special) {
                        return function() {
                            var that = this,
                                args = arguments,
                                mightThrow = function() {

                                    if(depth < maxDepth) {
                                        return;
                                    }
                                    returned = handler.apply(that, args);

                                    if(returned === deferred.promise()) {
                                        throw new TypeError("Thenable self-resolution");
                                    }

                                    then = returned &&
                                        (typeof returned === "object" || 
                                            typeof returned === "function") && returned.then;

                                    // handle a returned thenable
                                    if(isFunction(then)) {
                                        if(special) {
                                            the.call(
                                                returned,
                                                resolve(maxDepth, deferred, Identify, special),
                                                resolve(maxDepth, deferred, Thrower, special)
                                            );
                                        // normal processors (resolve) alse hook into progress
                                        }else {
                                            // ... and disregard older resolution values
                                            maxDepth ++;

                                            then.call(
                                                returned,
                                                resolve(maxDepth, deferred, Identify, special),
                                                resolve(maxDepth, deferred, Thrower, special),
                                                resolve(maxDepth, deferred, Identify, deferred.notifyWith)
                                            );
                                        }

                                    // handle all other returned values
                                    } else {

                                        // only substitube handlers pass on context and multipe 
                                        // values (non-spec behavior)
                                        if(handler !== Identify) {
                                            that = undefined;
                                            args = [returned];
                                        }

                                        // process the values
                                        // default process is resolve
                                        (special || deferred.resolveWith)(that, args);
                                    }
                                },
                                process = special
                                    ? mightThrow 
                                    : function(){
                                        try{
                                            mightThrow();
                                        } catch(e) {
                                            if(jqueryAlike.Deferred.exceptionHook) {
                                                jqueryAlike.Deferred.exceptionHook(e, process.stackTrace);
                                            }

                                            if(depth + 1 >= maxDepth) {

                                                if(handler !== Thrower) {
                                                    that = undefined;
                                                    args = [e];
                                                }
                                                deferred.rejectWith(that, args);
                                            }
                                        }
                                    };

                                // re-resolve promises immediately to dodge false rejection from
                                // subsequent errors

                                if(depth) {
                                    process();
                                } else {

                                    if(jqueryAlike.Deferred.getStackHook) {
                                        process.stacckTrace = jqueryAlike.Deferred.getStackHook();
                                    }
                                    window.setTimeout(process);
                                }

                        // return fn
                        };
                    }

                    return jqueryAlike.Deferred(function(newDefer) {

                        // progress handers add
                        tuples[0][3].add(
                            resolve(0, newDefer,
                                isFunction(onProcess)
                                    ? onProcess
                                    : Identify,
                                newDefer.notifyWith
                                )
                        );

                        // fulfilled handlers add
                        tuples[1][3].add(
                            resolve(0, newDefer,
                                isFunction(onFulfilled)
                                    ? onFulfilled
                                    : Identify
                                )
                        );

                        // reject handlers add
                        tuples[2][3].add(
                            resolve(0, newDefer,
                                isFunction(onRejected)
                                    ? onRejected
                                    : Thrower
                                    )
                        );
                    }).promise();
                 },

                // get a promise for this deferred
                // if obj is provided, the promise aspect is added to the object
                promise: function(obj) {
                    return obj != null ? jqueryAlike.extend(obj, promise) : promise;
                }
            },
            deferred = {};


            // add list-specific methods
            jqueryAlike.each(tuples, function(i, tuple) {
                var list = tuple[2],
                    stateString = tuples[5];

                // promise.[progress | done | fail] = list.add
                promise[tuple[1]] = list.add;

                // handle state
                if(stateString) {
                    list.add(
                        function() {

                            // state = "rejected" | "rejected" | i.e., fulfilled
                            state = stateString;
                        },

                        tuples[3 - i][2].disable,

                        tuples[3 - i][3].disable,

                        tuples[0][2].lock,

                        tuples[0][3].lock
                    );
                }

                // (progress | fulfilled | rejected) handlers.fire
                list.add(tuple[3].fire);

                deferred[tuple[0]] = function() {
                    deferred[tuple[0] + "With"]
                        (this === deferred 
                            ? undefined 
                            : this, 
                        arguments);

                    return this;
                };

                // inner is: (notifyWith | resolveWith, rejectWith)
                deferred[tuple[0] + "With"] = list.fireWith;
            });

            // make the deferred a promise
            promise.promise(deferred);

            // call given func if any
            if(func) {
                func.call(deferred, deferred);
            }

            return deferred;
        }
    });

    jqueryAlike.readyException = function(err) {
        window.setTimeout(function() {
            throw err;
        });
    };

    // The deferred used on DOM ready
    var readyList = jqueryAlike.Deferred();

    jqueryAlike.fn.ready = function(fn) {
        readyList.then(fn)
            .catch(function(err) {
                jqueryAlike.readyException(err);
            });

        return this;
    };

    jqueryAlike.extend({
        // handle when the dom is ready
        ready: function(wait) {

            if(wait === true
                ? -- jqueryAlike.readyWait
                : jqueryAlike.isReady) {
                    return;
                }

            // remember that the dome is ready
            jqueryAlike.isReady = true;

            // if a normal dom ready event fired, decrement, and wait if need be
            if(wait !== true && -- jqueryAlike.readyWait > 0) {
                return;
            }

            // if there are functions bound, to execute
            readyList.resolveWith(document, [jqueryAlike]);
        }
    })

    jqueryAlike.ready.then = readyList.then;

    // the ready event handler and self cleanup method
    function completed() {
        document.removeEventListener("DOMContentLoaded", completed);
        window.removeEventListener("load", completed);
        jqueryAlike.ready();
    }

    // catch cases where $(document).reqdy() is called
    // after the brower event has already occurred.
    // support: IE <= 9 - 10 only
    // older IE sometimes signals "interactive" too soon
    if(document.readState === "complete" ||
        (document.readyState !== "loading" && !document.documentElement.doScroll)) {

            // handle it asynchronously to allow scripts the opportunity to delay ready
            window.setTimeout(jqueryAlike.ready);

        }else {

            // use the handle event callback
            document.addEventListener("DOMContentLoaded", completed);

            // a fallback to window.onload, that will always work
            window.addEventListener("load", completed);
        }

    // give the init function the jqueryAlike prototype for later instantiation
    init.prototype = jqueryAlike.fn;

    // initialize central reference
    rootjQuery = jqueryAlike(document);

    if(typeof define === "functionn" && define.amd) {
        define("jqueryAlike", [], function() {
            return jqueryAlike;
        })
    }

    var
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