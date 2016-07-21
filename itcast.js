/**
 * Created by Xiancheng on 2016/6/27.
 */
(function(window){
    //选择器模块
    var select=(function (){
        /**
         *
         * @param idName
         * @param parent 是一个DOM元素
         * @returns {Element}
         */
        function getId(idName, parent) {

            var dom = document.getElementById(idName);
            //1、有传递了parent参数
            if (parent) {
                //默认值，指向父节点
                var parentNode = dom.parentNode;
                //两种方案：1、先查找document.getElementById(idName)查找到这个元素，
                //              之后再判断这个元素的父元素或者祖先元素含有parent
                while (parentNode) {
                    if (parentNode === parent) {
                        return dom;
                        // break;
                    }
                    parentNode = parentNode.parentNode;
                }
                return null;


                // var parentNode=dom.parentNode;
                // if(parentNode===parent){
                //     //返回
                // }else{
                //     parentNode=parentNode.parentNode;
                //     if(parentNode===parent){
                //         //...返回
                //     }else{
                //         //...
                //     }
                // }

                //..........2、先获取parent下面的所有的子元素，
                //                  判断这里面是否含有document.getElementById(idName)
                //.............再对每一个子元素进行遍历，再查找这些子元素的子元素，是否有这个元素
                //.............对子元素下面的子元素进行遍历，。。。。。
            } else {
                //2、如果没有传递parent参数
                return document.getElementById(idName);
            }


        }

        function getTags(tagName, parent) {
            //逻辑中断，短路操作
            parent = parent || document;
            return parent.getElementsByTagName(tagName);

            // if(parent){
            //     return parent.getElementsByTagName(tagName);
            // }else{
            //     return document.getElementsByTagName(tagName);
            // }
        }

        function getClasses(className, parent) {
            parent = parent || document;
            //1、首先判断浏览器是否支持getElementsByClassName()
            if (document.getElementsByClassName) {
                return parent.getElementsByClassName(className);
            } else {
                var result = [];
                //2、手写兼容性代码
                //2.1、获取页面中所有的元素
                var allTags = getTags("*", parent);
                //2.2、遍历allTags
                for (var i = 0; i < allTags.length; i++) {
                    var dom = allTags[i];
                    //2.3、获取class属性的值
                    var cName = dom.className;
                    //2.4、判断cName中是否包含className
                    //2.4.1、给cName和className分别添加前后空格
                    var cNameChange = ' ' + cName + ' ';
                    var classNameChange = ' ' + className + ' ';
                    //2.4.2、查找cNameChange是否存在classNameChange——>indexOf()
                    var index = cNameChange.indexOf(classNameChange);
                    if (index != -1) {
                        //2.4.3、 将dom元素放入结果数组中
                        result.push(dom);
                    }

                }
                return result;
            }


        }

        /**
         * get("div",dom)
         * @param selector id选择器，class选择器，tag选择器
         * @param parent：DOM元素/DOM数组/字符串
         */
        function get(selector, parent) {
            //保存返回结果
            var result = [];
            var reg = /^(?:#(\w+)|[.]([-\w]+)|(\w+|\*))$/;
            //1、首先判断selector是不是字符串
            if (typeof selector === 'string') {
                if(!parent){
                    parent=[document];
                }else if(typeof parent==="string"){//选择器：id class tag *
                    //将parent重新设置值为get(parent)
                    parent=get(parent);//结果为DOM数组
                }else if (parent && parent.nodeType) {//dom元素
                    //将DOM元素构造成DOM数组，重新修改参数parent的值
                    parent = [parent];
                }

                //parent是一个DOM数组
                for (var i = 0; i < parent.length; i++) {
                    //获取到每一个parent
                    var singleParent = parent[i];
                    //对每个parent查找他的子元素
                    var temp = reg.exec(selector);//[整个字符串，id名称，class的名称，标签名称]
                    // //2、selector的选择器类型
                    var name;
                    if (name = temp[1]) {//id
                        var idResult = getId(name, singleParent);
                        if (idResult) {
                            result.push(idResult);
                        }
                        //id是唯一的，但是这个指定的id是在我们的parent下面吗？
                    } else if (name = temp[2]) {
                        result.push.apply(result, getClasses(name, singleParent));
                    } else if (name = temp[3]) {
                        result.push.apply(result, getTags(name, singleParent));
                    }
                }


            }
            return result;
        }

        /**
         *
         * @param selector 'div,p,span'
         * @param parent
         */
        function $group(selector,parent){
            //0,创建要给结果数组u
            var result=[];
            //1，判断selector类型：字符串
            if(typeof selector === "string"){
                //2，将selector用split方法分隔成字符串数组
                var groups=selector.split(",");//==>['div','p','span']
                //3，对数组里面每个元素执行get()，返回数组result
                itcast.each(groups,function(i,group){
                    //4，将单组结果放入整个结果数组中
                    var singleResult=get(group,parent);
                    result.push.apply(result,singleResult);
                })

            }
            return result;

        }

        /**
         * 层次选择器
         * @param selector 'div form input',document.body
         * @param parent
         */
        function $level(selector,parent){
            var result=[];
            //1，判断selector类型->字符串
            if(typeof selector === "string"){
                //2，用空格分隔selector成为字符串数组-->['div','form','input']
                var levels=selector.split(' ');
                //3，遍历字符串数组，对每个元素执行get函数,获取单个结果
                itcast.each(levels,function(i,level){
                    //4,如果是第一次遍历，var result=get('div')
                    //5,如果不是第一次遍历，应该：result=get('form',result)
                    //6.                       result=get('input',result)

                    if(i===0){
                        result=get(level,parent);// var s1=document下面的div
                    }else{
                        result=get(level,result);//var s2=s1下面的form
                    }
                })

                //7，最终result的值就是返回值
            }
            return result;

        }

        /**
         * 分组+层次选择器
         * @param selector 'head meta,div input,body script'
         * @param parent
         */
        function $groupAndLevel(selector,parent){
            var result=[];
            //1/判断selector类型
            if(typeof selector === 'string'){
                //2，再用逗号分隔成字符串数组u（多组） -->groups
                var groups=selector.split(',');
                //3，多groups进行遍历，对每个group调用$level，产生一个结果singleResult
                itcast.each(groups,function(i,group){
                    var singleResult=$level(group,parent);
                    //4，将singleResult里面的每一个dom元素添加到结果数组中
                    result.push.apply(result,singleResult);
                })

            }
            //5,返回结果数组
            return result;


        }

        return $groupAndLevel;
    }());

    /**
     * 将html字符串转换为DOm数组
     * @param html '<div>aaa</div><div>bbb</div>'
     */
    function createElements(html){
        var result=[];
        if(typeof html === 'string'){
            //1、先创建一个div，并设置div的innerHTML属性为参数html
            var div=document.createElement("div");
            div.innerHTML=html;
            //2、遍历div中的子节点，判断这个节点是不是一个元素，如果是元素就添加到结果数组中
            var children=div.childNodes;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if(child.nodeType===1){//判断是元素节点
                    result.push(child);
                }
            }

        }
        return result;
    }

    function itcast(selector,context){
        return new itcast.fn.init(selector,context);
    }
    itcast.fn=itcast.prototype={
        push:[].push,
        splice:[].splice,
        //核心方法：没有核心方法框架将无法运行
        /**
         *
         * @param selector 字符串选择器   Dom元素   html字符串
         * @param context
         * @returns {itcast}
         */
        init:function(selector,context){
            //删除原有的元素:借用数组的splice方法
            this.splice.apply(this,[0,this.length]);

            if(itcast.isString(selector)){//选择器，html字符串
                //html字符串
                if(selector.charAt(0)==='<' && selector[selector.length-1]==='>' && selector.length>=3){
                    var doms=createElements(selector);
                    this.push.apply(this,doms);
                }else{//选择器

                    //借用数组的push方法来完成插入元素的功能，从而形成：伪数组结构
                    this.push.apply(this,select(selector,context));//{0:div,1:span,length:2}
                }


            }else if(itcast.isDom(selector)){//DOM元素
                this.push.call(this,selector);//{0:div,length:1}
            }else if(itcast.isFunction(selector)){
                //获取之前绑定的onload事件的响应函数
                var oldLoad=window.onload;
                //判断oldLoad是不是一个函数
                if(itcast.isFunction(oldLoad)){
                    window.onload=function () {
                        oldLoad();
                        selector();
                    }
                }else{
                    window.onload=selector;
                }




            }else if(itcast.isItcast(selector)){ //init类型的对象

                //实例 instanceof 构造函数(实例的直接构造函数，也可能是实例的继承对象的构造函数)


                return selector;
            }else if(itcast.isLikeArray(selector)){//Dom数组/DOM伪数组
                this.push.apply(this,selector);
            }


            return this;
        }
    };

    itcast.fn.init.prototype=itcast.fn;

    itcast.fn.extend=itcast.extend=function(){
        //目标对象：
        var target;
        //源对象
        var sources=[];

        //1、判断参数个数
        if(arguments.length===0) return;

        if(arguments.length===1){
            target=this;
            sources.push(arguments[0]);
        }else{
            target=arguments[0];
            sources.push.apply(sources,arguments);
            //剔除第一个元素
            sources.splice(0,1);
        }

        //2、遍历sources
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            //3、遍历source上面的属性
            for(var key in source){
                //4、设置target同名属性
                target[key]=source[key];
            }

        }

        //3、返回目标对象
        return target;



    };

    //功能类方法：框架有没有这些方法都不影响框架的运行
    //..........有了这个功能类方法，框架将会变得更加强大

    //功能类方法1：DOM方法

    //=====================CSS模块====================
    itcast.fn.extend({
        //功能1：获取样式：只能获取第一个DOM元素的样式
        //功能2：设置单个样式
        //功能3：设置多个样式
        css:function(){
            if(arguments.length===0) return this;

            //参数个数为1：
            if(arguments.length===1){//获取样式，设置多个样式
                //判断参数类型1：字符串
                if(typeof arguments[0] === 'string'){
                    //获取第一个DOM元素
                    var firstDom=this[0];
                    //样式的名称
                    var styleName=arguments[0];
                    //获取firstDom的指定样式
                    if(typeof window.getComputedStyle === 'function'){
                        return window.getComputedStyle(firstDom,null)[styleName];
                    }else{
                        return firstDom.currentStyle[styleName];
                    }
                }else{//参数类型：对象 {fontSize:'30px',color:'blue'}
                    var styleObj=arguments[0];

                    //this：init类型的对象
                    this.each(function(){
                        //this：DOM元素
                        var _this=this;

                        //遍历styleObj
                        $.each(styleObj,function(key,value){
                            //设置DOM元素的指定样式
                            _this.style[key]=value;
                        })
                    });
                    return this;
                }
            }else{
                var styleName=arguments[0];
                var styleValue=arguments[1];
                //遍历当前对象(init类型)中的DOM元素
                this.each(function(){
                    //this：dom元素
                    this.style[styleName]=styleValue;
                });
                //实现链式编程
                return this;

            }


        },
        //让当前对象的每一个DOM元素显示出来
        show:function(){
            //遍历当前对象的每一个DOM元素
            return this.css('display','block');

//            this.each(function(){
//                //this:dom元素
//                this.style.display='block';
//            });
//            return this;
        },

        hide:function(){
            return this.css('display','none');
        },
        //判断当前对象中的每一个DOM元素，看他是隐藏的吗？如果隐藏，就显示出来，
        //。。。。。。。。。。。。。。。。。。。。。。。。反之，就隐藏起来
        toggle:function(){
            this.each(function(){
                //this：DOM元素

                //判断当前DOM元素是否是隐藏的吧？
                var isHide=$(this).css('display');
                if(isHide==='none'){
                    $(this).show();
                }else{//状态是显示的状态，需要让这个元素隐藏起来
                    $(this).hide();
                }
            });
            return this;
        }
    });

    //=====================CSS模块 end================

    //===================属性模块===================
    itcast.fn.extend({
        //功能1：获取指定属性——获取第一个DOM元素的指定属性
        //功能2：设置单个属性——设置每一个DOM元素的单个属性
        //功能3：设置多个属性——................多个属性
        attr:function(){
            //参数个数为1：
            if(arguments.length===1){
                var arg0=arguments[0];
                //1、获取指定属性——参数是一个字符串
                if(itcast.isString(arg0)){
                    var firstDom=this[0];
                    //存在这个DOM元素的话
                    if(firstDom){
                        return firstDom.getAttribute(arg0);
                    }
                }else{
                    //2、设置多个属性 arg0={a:10,b:20,c:30}
                    this.each(function(){
                        //this:每一个DOM元素
                        var self=this;

                        //遍历arg0
                        itcast.each(arg0,function(key,value){
                            self.setAttribute(key,value);
                        })

                    });
                    return this;
                }


            }else{
                //设置单个属性：
                var attrName=arguments[0];
                var attrValue=arguments[1];

                this.each(function () {
                    //this:每一个DOM元素
                    this.setAttribute(attrName,attrValue);

                });
                return this;

            }
        },
        /**
         * 判断元素是否具有某一个class——返回第一个DOM元素
         * 返回值：布尔值，true：存在，false：不存在
         */
        hasClass:function(className){
            //获取第一个DOM元素
            var firstDom=this[0];
            if(!firstDom){
                return false;
            }else{
                //给className添加前后空格
                var classNameChange=' '+className+' ';
                //给元素的className属性添加前后空格
                var cName=firstDom.className;
                var cNameChange=' '+cName+' ';

                return cNameChange.indexOf(classNameChange)>=0;

//                return !!~cNameChange.indexOf(classNameChange);

                //~按位非操作的本质：操作数的负值减1
                //indexOf方法的返回值：    ~a          !!~a
                //-1                     0           false
                //0                      -1          true
                //1                      -2          true
                //2                      -3          true

            }
        }
    });

    //===================属性模块 end===================

    //=================DOM操作模块=====================

    itcast.fn.extend({
        //将当前对象的每一个DOM元素添加到参数对象中

        //当前对象有3个Dom元素，参数对象有5个Dom元素，最后产生15个
        appendTo: function () {
            var arg0 = arguments[0];//'.d3'

            //arg0只是一个字符串/Dom元素/Dom数组/init类型的对象
            var $parents = $(arg0);

            this.each(function () {
                //child是一个DOM元素，并且当成子元素来处理
                var child = this;

                $parents.each(function (parentIndex) {
                    //parent是一个DOM元素，并且当成父元素来处理
                    var parent = this;

                    //由于每一个DOM元素都只能有一个父元素，父元素又有很多个
                    //解决方案：判断当前父元素是不是最后一个父元素，
                    //如果是最后一个父元素，就把child本身添加到parent中
                    if (parentIndex === $parents.length - 1) {
                        //往parent中添加child
                        parent.appendChild(child);
                    } else {
                        //如果不是...............child的克隆一份给parent
                        parent.appendChild(child.cloneNode(true));
                    }


                })
            });



            return this;
        },
        //在当前对象中添加各种Dom元素(参数)

        //参数是子元素，当前对象的DOM元素是父元素
        append:function(){
            var arg0=arguments[0];
            $(arg0).appendTo(this);
            return this;
        },
        //往当前对象的每一个DOM元素的最前面插入节点
        //当前对象是父元素的集合，参数对象是一个子元素的集合
        prepend:function(){
            if(!arguments[0]) return  this;

            var $child=$(arguments[0]);

            var $parents=this;
            this.each(function(parentIndex){
                var parent=this;

                $child.each(function(){
                    var child=this;

                    //首先找到parent已有的第一个子节点
                    var firstChild=parent.firstChild;

                    //原因：一个子元素只能有一个父元素
                    //             判断当前父元素是否是最后一个父元素，如果是就把当前节点本身给父元素，
                    //......................................如果不是就把当前节点拷贝一份给父元素
                    if(parentIndex===$parents.length-1){
                        //父元素..........新的子元素，原有的第一个子元素
                        parent.insertBefore(child,firstChild);
                    }else{
                        //再把child插入到这个子节点之前
                        parent.insertBefore(child.cloneNode(true),firstChild);
                    }



                })
            });
            return this;
        },

        //当前对象是子元素的集合，参数对象是父元素的集合
        prependTo:function(){
            var $children=this;
            var $parents=$(arguments[0]);

            $parents.prepend($children);
            return this;
        },

        /**
         * 删除当前对象的每一个DOM元素的所有子节点
         * @returns {empty}
         */
        empty:function(){
            this.each(function(){
                //this:dom元素
                this.innerHTML="";
            });
            return this;
        },

        /**
         * 删除当前对象的每一个DOM元素，同时删除DOM元素自身
         * @returns {remove}
         */
        remove:function(){
            this.each(function(){
                //先查找父节点，将父节点执行删除方法，删除this
                this.parentNode.removeChild(this);
            });
            return this;

        }
    });
    //=================DOM操作模块  end=====================



    //功能类方法2：工具类方法：跟DOM操作不直接挂钩，只是简单的封装了过程
    itcast.extend({
        isDom:function(dom){
            return !!dom.nodeType;
        },
        isItcast:function(it){
            return it instanceof  itcast;
        },

        //去除前后空格
        trim:function(str){
            if(itcast.isString(str)){
                //去除前后空格：正则表达式
                return str.replace(/^\s+/,'').replace(/\s+$/,'');
            }
        },
        isString:function(str){
            return typeof str ==='string';
        },
        isFunction:function(fn){
            return typeof fn === 'function';
        },
        isNumber:function(num){
            return typeof num === 'number';
        },
        isObject:function(obj){
            return obj !== null && typeof obj ==='object';
        },
        //数组，伪数组
        //返回布尔值
        isLikeArray:function(arr){
            return  !!arr && (typeof arr === 'object') && typeof arr.length ==='number' && arr.length>=0
        }
    });

    //itcast函数跟each的关系：itcast函数只是each函数的宿主（寄宿的对象）
    itcast.each=function(arr,callback){
        var i;
        //判断是数组还是伪数组
        if(itcast.isLikeArray(arr)){
            //完成对伪数组、数组的遍历
            for (i = 0; i < arr.length;) {
                if(callback.call(arr[i],i,arr[i++]) === false) {
                    break;
                }
            }
        }else{
            //对对象的遍历:for...in
            for( i in arr){
                if(callback.call(arr[i],i,arr[i]) === false) {
                    break;
                }

            }
        }


    };

    //遍历当前对象中的dom元素——目的：让init类型的对象可以调用（init类型的对象继承自itcast.fn）
    itcast.fn.each=function(callback){
        itcast.each(this,callback);
    };

    itcast.extend({
        easing: {
            linear: function( p, n, firstNum, diff ) {
                return firstNum + diff * p;
            },
            swing: function( p, n, firstNum, diff ) {
                return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
            }
        }
    });

    //================事件模块=====================
    itcast.fn.extend({
        //$("input").on('click',function(){})
        on:function(type,fn){
            if(itcast.isString(type)){
                this.each(function(){
                    //this:dom元素
                    if(itcast.isFunction(document.addEventListener)){
                        this.addEventListener(type,fn);
                    }else{
                        this.attachEvent('on'+type,fn);
                    }

                });
            }

            return this;
        }
    });
    itcast.fn.extend({

        /**
         *
         * @param type 事件类型的名称(不带on前缀)
         * @param callback 事件响应函数
         */
        off:function(type,callback){
            if(itcast.isString(type)){
                this.each(function(){
                    //能力检测：
                    if(itcast.isFunction(document.removeEventListener)){
                        this.removeEventListener(type,callback);
                    }else{
                        this.detachEvent("on"+type,callback);
                    }
                })
            }
            return this;


        }
    });
    //连续扩展
    var eventTypes='click dblclick keyup keydown mouseenter mouseleave mouseover load mousedown'
        .split(" ");
    itcast.each(eventTypes,function(i,type){
        itcast.fn[this]=function(callback){
            //this:init类型的对象
            return this.on(type,callback);
        }
    });
    itcast.fn.extend({
        //鼠标进入元素的时候，执行参数1，
        //鼠标移出元素的时候，执行参数2
        hover:function(callback1,callback2){
            return this.mouseenter(callback1).mouseleave(callback2);
        }
    });
    //====================事件模块 end=======================

    window.$=window.itcast=itcast}(window));