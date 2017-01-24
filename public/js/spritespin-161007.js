!function($){"use strict";function simulateEvent(name,e){for(var id in instances)if(instances.hasOwnProperty(id)){var i,module,data=instances[id];for(i=0;i<data.mods.length;i+=1)module=data.mods[i],"function"==typeof module[name]&&module[name].apply(data.target,[e,data])}}function bindSimulatedEvent(eName){$(window.document).bind(eName+"."+name,function(e){simulateEvent("document"+eName,e)})}function handleResizeEvent(){for(var id in instances)if(instances.hasOwnProperty(id)){var data=instances[id];data.responsive&&Spin.boot(data)}}function pushInstance(data){idCounter+=1,data.id=idCounter,instances[idCounter]=data}function popInstance(data){delete instances[data.id]}function padNumber(num,length,pad){for(num=String(num);num.length<length;)num=String(pad)+num;return num}function clamp(value,min,max){return value>max?max:min>value?min:value}function wrap(value,min,max,size){for(;value>max;)value-=size;for(;min>value;)value+=size;return value}function prevent(e){return e.preventDefault(),!1}function log(){window.console&&window.console.log&&window.console.log.apply(window.console,arguments)}function bind(target,event,func){func&&target.bind(event+"."+name,function(e){func.apply(target,[e,target.spritespin("data")])})}function unbind(target){target.unbind("."+name)}function load(opts){var i,img,src="string"==typeof opts.source?[opts.source]:opts.source,count=0,images=[],targetCount=opts.preloadCount||src.length,completed=!1,firstLoaded=!1,tick=function(){count+=1,"function"==typeof opts.progress&&opts.progress({index:$.inArray(this,images),loaded:count,total:src.length,percent:Math.round(count/src.length*100)}),firstLoaded=firstLoaded||this===images[0],!completed&&count>=targetCount&&firstLoaded&&"function"==typeof opts.complete&&(completed=!0,opts.complete(images))};for(i=0;i<src.length;i+=1)img=new Image,images.push(img),img.onload=img.onabort=img.onerror=tick,img.src=src[i];"function"==typeof opts.initiated&&opts.initiated(images)}function detectSubsampling(img,size){var iw=(size||img).width,ih=(size||img).height;if(1048576>=iw*ih)return!1;var canvas;if(canvas=document.createElement("canvas"),!canvas||!canvas.getContext)return!1;var context=canvas.getContext("2d");if(!context)return!1;canvas.width=canvas.height=1,context.fillStyle="#FF00FF",context.fillRect(0,0,1,1),context.drawImage(img,-iw+1,0);try{var dat=context.getImageData(0,0,1,1).data;return 255===dat[0]&&0===dat[1]&&255===dat[2]}catch(err){return log(err.message,err.stack),!1}}function naturalSize(image){if(null!=image.naturalWidth)return{width:image.naturalWidth,height:image.naturalHeight};var img=new Image;return img.src=image.src,{width:img.width,height:img.height}}function pixelRatio(context){var devicePixelRatio=window.devicePixelRatio||1,backingStoreRatio=context.webkitBackingStorePixelRatio||context.mozBackingStorePixelRatio||context.msBackingStorePixelRatio||context.oBackingStorePixelRatio||context.backingStorePixelRatio||1;return devicePixelRatio/backingStoreRatio}var name="spritespin",Spin={};window.SpriteSpin=Spin,Spin.namespace=name,Spin.mods={},Spin.eventNames=["mousedown","mousemove","mouseup","mouseenter","mouseover","mouseleave","dblclick","mousewheel","touchstart","touchmove","touchend","touchcancel","selectstart","gesturestart","gesturechange","gestureend"],Spin.eventsToPrevent=["dragstart"],Spin.defaults={source:void 0,width:void 0,height:void 0,frames:void 0,framesX:void 0,lanes:1,sizeMode:void 0,module:"360",behavior:"drag",renderer:"canvas",lane:0,frame:0,frameTime:40,animate:!0,reverse:!1,loop:!0,stopFrame:0,wrap:!0,wrapLane:!1,sense:1,senseLane:void 0,orientation:"horizontal",detectSubsampling:!0,scrollThreshold:50,preloadCount:void 0,onInit:void 0,onProgress:void 0,onLoad:void 0,onFrame:void 0,onDraw:void 0};var idCounter=0,instances={};Spin.instances=instances;var resizeTimeout=null;$(window).on("resize",function(){clearTimeout(resizeTimeout),resizeTimeout=setTimeout(handleResizeEvent,100)});for(var i=0;i<Spin.eventNames.length;i+=1)bindSimulatedEvent(Spin.eventNames[i]);Spin.clamp=clamp,Spin.wrap=wrap,Spin.bind=bind,Spin.sourceArray=function(path,opts){var fStart=0,fEnd=0,lStart=0,lEnd=0,digits=opts.digits||2;opts.frame&&(fStart=opts.frame[0],fEnd=opts.frame[1]),opts.lane&&(lStart=opts.lane[0],lEnd=opts.lane[1]);var i,j,temp,result=[];for(i=lStart;lEnd>=i;i+=1)for(j=fStart;fEnd>=j;j+=1)temp=path.replace("{lane}",padNumber(i,digits,0)),temp=temp.replace("{frame}",padNumber(j,digits,0)),result.push(temp);return result},Spin.measureSource=function(data){var img=data.images[0],size=naturalSize(img);if(1===data.images.length){if(data.sourceWidth=size.width,data.sourceHeight=size.height,data.detectSubsampling&&detectSubsampling(img,size)&&(data.sourceWidth/=2,data.sourceHeight/=2),data.framesX=data.framesX||data.frames,!data.frameWidth||!data.frameHeight)if(data.framesX){data.frameWidth=Math.floor(data.sourceWidth/data.framesX);var framesY=Math.ceil(data.frames*data.lanes/data.framesX);data.frameHeight=Math.floor(data.sourceHeight/framesY)}else data.frameWidth=size.width,data.frameHeight=size.height}else data.sourceWidth=data.frameWidth=size.width,data.sourceHeight=data.frameHeight=size.height,detectSubsampling(img,size)&&(data.sourceWidth=data.frameWidth=size.width/2,data.sourceHeight=data.frameHeight=size.height/2),data.frames=data.frames||data.images.length},Spin.resetInput=function(data){data.startX=data.startY=void 0,data.currentX=data.currentY=void 0,data.oldX=data.oldY=void 0,data.dX=data.dY=data.dW=0,data.ddX=data.ddY=data.ddW=0},Spin.updateInput=function(e,data){void 0===e.touches&&void 0!==e.originalEvent&&(e.touches=e.originalEvent.touches),data.oldX=data.currentX,data.oldY=data.currentY,void 0!==e.touches&&e.touches.length>0?(data.currentX=e.touches[0].clientX||0,data.currentY=e.touches[0].clientY||0):(data.currentX=e.clientX||0,data.currentY=e.clientY||0),(void 0===data.oldX||void 0===data.oldY)&&(data.oldX=data.currentX,data.oldY=data.currentY),(void 0===data.startX||void 0===data.startY)&&(data.startX=data.currentX,data.startY=data.currentY,data.clickframe=data.frame,data.clicklane=data.lane),data.dX=data.currentX-data.startX,data.dY=data.currentY-data.startY,data.ddX=data.currentX-data.oldX,data.ddY=data.currentY-data.oldY,data.ndX=data.dX/data.width,data.ndY=data.dY/data.height,data.nddX=data.ddX/data.width,data.nddY=data.ddY/data.height},Spin.updateFrame=function(data,frame,lane){data.lastFrame=data.frame,data.lastLane=data.lane,void 0!==frame?data.frame=Number(frame):data.animation&&(data.frame+=data.reverse?-1:1),data.animation?(data.frame=wrap(data.frame,0,data.frames-1,data.frames),data.loop||data.frame!==data.stopFrame||Spin.stopAnimation(data)):data.wrap?data.frame=wrap(data.frame,0,data.frames-1,data.frames):data.frame=clamp(data.frame,0,data.frames-1),void 0!==lane&&(data.lane=lane,data.wrapLane?data.lane=wrap(data.lane,0,data.lanes-1,data.lanes):data.lane=clamp(data.lane,0,data.lanes-1)),(data.lastFrame!=data.frame||data.lastLane!=data.lane)&&data.target.trigger("onFrameChanged",data),data.target.trigger("onFrame",data),data.target.trigger("onDraw",data)},Spin.stopAnimation=function(data){data.animate=!1,data.animation&&(window.clearInterval(data.animation),data.animation=null)},Spin.setAnimation=function(data){data.animate?Spin.requestFrame(data):Spin.stopAnimation(data)},Spin.requestFrame=function(data){data.animation||(void 0===data.frameFunction&&(data.frameFunction=function(){try{Spin.updateFrame(data)}catch(ignore){}}),data.animation=window.setInterval(data.frameFunction,data.frameTime))},Spin.setModules=function(data){var i,modName,mod;for(i=0;i<data.mods.length;i+=1)modName=data.mods[i],"string"==typeof modName&&(mod=Spin.mods[modName],mod?data.mods[i]=mod:$.error("No module found with name "+modName))},Spin.displaySize=function(data){var w=Math.floor(data.width||data.frameWidth||data.target.innerWidth()),h=Math.floor(data.height||data.frameHeight||data.target.innerHeight()),a=w/h;return{width:w,height:h,aspect:a}},Spin.calculateInnerLayout=function(data){var w=Math.floor(data.width||data.frameWidth||data.target.innerWidth()),h=Math.floor(data.height||data.frameHeight||data.target.innerHeight()),a=w/h,w1=data.frameWidth||w,h1=data.frameHeight||h,a1=w1/h1,css={width:"100%",height:"100%",top:0,left:0,bottom:0,right:0,position:"absolute",overflow:"hidden"},mode=data.sizeMode;return mode&&"scale"!=mode?("original"==mode?(css.width=w1,css.height=h1):"fit"==mode?a1>=a?(css.width=w,css.height=w/a1):(css.height=h,css.width=h*a1):"fill"==mode?a1>=a?(css.height=h,css.width=h*a1):(css.width=w,css.height=w/a1):(css.width=w,css.height=h),css.width=0|css.width,css.height=0|css.height,css.top=(h-css.height)/2|0,css.left=(w-css.width)/2|0,css.right=css.left,css.bottom=css.top,css):css},Spin.setLayout=function(data){data.target.attr("unselectable","on").css({width:"",height:"","-ms-user-select":"none","-moz-user-select":"none","-khtml-user-select":"none","-webkit-user-select":"none","user-select":"none"});var w=Math.floor(data.width||data.frameWidth||data.target.innerWidth()),h=Math.floor(data.height||data.frameHeight||data.target.innerHeight());if(data.responsive&&"function"==typeof window.getComputedStyle){var style=getComputedStyle(data.target[0]);if(style.width){var a=w/h;w=0|Number(style.width.replace("px","")),h=w/a|0}}data.target.css({width:w,height:h,position:"relative",overflow:"hidden"});var css=Spin.calculateInnerLayout(data);data.stage.css(css).hide(),data.canvas&&(data.canvasRatio=data.canvasRatio||pixelRatio(data.context),data.canvas[0].width=css.width*data.canvasRatio||w,data.canvas[0].height=css.height*data.canvasRatio||h,data.canvas.css(css).hide(),data.context.scale(data.canvasRatio,data.canvasRatio))},Spin.setEvents=function(data){var i,j,mod,target=data.target;for(unbind(target),j=0;j<Spin.eventsToPrevent.length;j+=1)bind(target,Spin.eventsToPrevent[j],prevent);for(i=0;i<data.mods.length;i+=1){for(mod=data.mods[i],j=0;j<Spin.eventNames.length;j+=1)bind(target,Spin.eventNames[j],mod[Spin.eventNames[j]]);bind(target,"onInit",mod.onInit),bind(target,"onProgress",mod.onProgress),bind(target,"onLoad",mod.onLoad),bind(target,"onFrameChanged",mod.onFrameChanged),bind(target,"onFrame",mod.onFrame),bind(target,"onDraw",mod.onDraw)}bind(target,"onLoad",function(e,data){Spin.setAnimation(data)}),bind(target,"onInit",data.onInit),bind(target,"onProgress",data.onProgress),bind(target,"onLoad",data.onLoad),bind(target,"onFrameChanged",mod.onFrameChanged),bind(target,"onFrame",data.onFrame),bind(target,"onDraw",data.onDraw)},Spin.boot=function(data){Spin.setModules(data),Spin.setLayout(data),Spin.setEvents(data),data.target.addClass("loading").trigger("onInit",data),data.loading=!0,load({source:data.source,preloadCount:data.preloadCount,progress:function(progress){data.target.trigger("onProgress",[progress,data])},complete:function(images){data.images=images,data.loading=!1,Spin.measureSource(data),Spin.setLayout(data),data.stage.show(),data.target.removeClass("loading").trigger("onLoad",data).trigger("onFrame",data).trigger("onDraw",data)}})},Spin.create=function(options){var $this=options.target,data=$this.data(name);if(data)$.extend(data,options);else{if(data=$.extend({},Spin.defaults,options),data.source=data.source||[],$this.find("img").each(function(){data.source.push($(this).attr("src"))}),$this.empty().addClass("spritespin-instance").append("<div class='spritespin-stage'></div>"),"canvas"===data.renderer){var canvas=$("<canvas class='spritespin-canvas'></canvas>")[0];canvas.getContext&&canvas.getContext("2d")?(data.canvas=$(canvas),data.context=canvas.getContext("2d"),$this.append(data.canvas),$this.addClass("with-canvas")):data.renderer="image"}data.target=$this,data.stage=$this.find(".spritespin-stage"),$this.data(name,data),pushInstance(data)}"string"==typeof data.source&&(data.source=[data.source]),data.mods&&(delete data.behavior,delete data.module),(data.behavior||data.module)&&(data.mods=[],data.behavior&&data.mods.push(data.behavior),data.module&&data.mods.push(data.module),delete data.behavior,delete data.module),Spin.boot(data)},Spin.destroy=function(data){data&&(popInstance(data),Spin.stopAnimation(data),unbind(data.target),data.target.removeData(name))},Spin.registerModule=function(name,module){return Spin.mods[name]&&$.error("Module name is already taken: "+name),module=module||{},Spin.mods[name]=module,module},Spin.Api=function(data){this.data=data},Spin.extendApi=function(methods){var key,api=Spin.Api.prototype;for(key in methods)methods.hasOwnProperty(key)&&(api[key]?$.error("API method is already defined: "+key):api[key]=methods[key]);return api},$.fn.spritespin=function(obj,value){if("data"===obj)return this.data(name);if("api"===obj){var data=this.data(name);return data.api=data.api||new Spin.Api(data),data.api}if("destroy"===obj)return $(this).each(function(){Spin.destroy($(this).data(name))});if(2===arguments.length&&"string"==typeof obj){var tmp={};tmp[obj]=value,obj=tmp}return"object"==typeof obj?(obj.target=obj.target||$(this),Spin.create(obj),obj.target):$.error("Invalid call to spritespin")}}(window.jQuery||window.Zepto||window.$),function($){"use strict";var SpriteSpin=window.SpriteSpin;SpriteSpin.extendApi({isPlaying:function(){return null!==this.data.animation},isLooping:function(){return this.data.loop},toggleAnimation:function(){this.data.animate=!this.data.animate,SpriteSpin.setAnimation(this.data)},stopAnimation:function(){this.data.animate=!1,SpriteSpin.setAnimation(this.data)},startAnimation:function(){this.data.animate=!0,SpriteSpin.setAnimation(this.data)},loop:function(value){return this.data.loop=value,SpriteSpin.setAnimation(this.data),this},currentFrame:function(){return this.data.frame},updateFrame:function(frame){return SpriteSpin.updateFrame(this.data,frame),this},skipFrames:function(step){var data=this.data;return SpriteSpin.updateFrame(data,data.frame+(data.reverse?-step:+step)),this},nextFrame:function(){return this.skipFrames(1)},prevFrame:function(){return this.skipFrames(-1)},playTo:function(frame,options){var data=this.data;if(options=options||{},options.force||data.frame!==frame){if(options.nearest){var a=frame-data.frame,b=frame>data.frame?a-data.frames:a+data.frames,c=Math.abs(a)<Math.abs(b)?a:b;data.reverse=0>c}return data.animate=!0,data.loop=!1,data.stopFrame=frame,SpriteSpin.setAnimation(data),this}}})}(window.jQuery||window.Zepto||window.$),function($){"use strict";function requestFullscreen(e){e=e||document.documentElement,e[fn.requestFullscreen]()}function exitFullscreen(){return document[fn.exitFullscreen]()}function fullscreenEnabled(){return document[fn.fullscreenEnabled]}function fullscreenElement(){return document[fn.fullscreenElement]}function isFullscreen(){return!!fullscreenElement()}function unbindChangeEvent(){$(document).unbind(changeEvent)}function bindChangeEvent(callback){unbindChangeEvent(),$(document).bind(changeEvent,callback)}function unbindOrientationEvent(){$(window).unbind(orientationEvent)}function bindOrientationEvent(callback){unbindOrientationEvent(),$(window).bind(orientationEvent,callback)}var fn=function(){for(var val,valLength,fnMap=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],i=0,l=fnMap.length,ret={};l>i;i++)if(val=fnMap[i],val&&val[1]in document){for(i=0,valLength=val.length;valLength>i;i++)ret[fnMap[0][i]]=val[i];return ret}return!1}(),changeEvent=fn.fullscreenchange+"."+SpriteSpin.namespace+"-fullscreen",orientationEvent="orientationchange."+SpriteSpin.namespace+"-fullscreen";SpriteSpin.extendApi({fullscreenEnabled:fullscreenEnabled,fullscreenElement:fullscreenElement,exitFullscreen:exitFullscreen,toggleFullscreen:function(opts){isFullscreen()?this.requestFullscreen(opts):this.exitFullscreen()},requestFullscreen:function(opts){opts=opts||{};var api=this,data=api.data,oWidth=data.width,oHeight=data.height,oSource=data.source,oSize=data.sizeMode,enter=function(){data.width=window.screen.width,data.height=window.screen.height,data.source=opts.source||oSource,data.sizeMode=opts.sizeMode||"fit",SpriteSpin.boot(data)},exit=function(){data.width=oWidth,data.height=oHeight,data.source=oSource,data.sizeMode=oSize,SpriteSpin.boot(data)};bindChangeEvent(function(){isFullscreen()?(enter(),bindOrientationEvent(enter)):(unbindChangeEvent(),unbindOrientationEvent(),exit())}),requestFullscreen(data.target[0])}})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function click(e,data){if(!data.loading&&data.stage.is(":visible")){SpriteSpin.updateInput(e,data);var half,pos,target=data.target,offset=target.offset();"horizontal"===data.orientation?(half=target.innerWidth()/2,pos=data.currentX-offset.left):(half=target.innerHeight()/2,pos=data.currentY-offset.top),SpriteSpin.updateFrame(data,data.frame+(pos>half?1:-1))}}SpriteSpin.registerModule("click",{mouseup:click,touchend:click})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function dragStart(e,data){data.loading||data.dragging||!data.stage.is(":visible")||(data.dragFrame=data.frame||0,data.dragLane=data.lane||0,data.dragging=!0,SpriteSpin.updateInput(e,data))}function dragEnd(e,data){data.dragging&&(data.dragging=!1,SpriteSpin.resetInput(data))}function drag(e,data){if(data.dragging){if(SpriteSpin.updateInput(e,data),Math.abs(data.ddX)+Math.abs(data.ddY)>data.scrollThreshold)return data.dragging=!1,void SpriteSpin.resetInput(data);e.preventDefault();var angle=0;angle="number"==typeof data.orientation?(Number(data.orientation)||0)*Math.PI/180:"horizontal"===data.orientation?0:Math.PI/2;var sn=Math.sin(angle),cs=Math.cos(angle),x=(data.nddX*cs-data.nddY*sn)*data.sense||0,y=(data.nddX*sn+data.nddY*cs)*(data.senseLane||data.sense)||0;data.dragFrame+=data.frames*x,data.dragLane+=data.lanes*y;var frame=Math.floor(data.dragFrame),lane=Math.floor(data.dragLane);SpriteSpin.updateFrame(data,frame,lane),SpriteSpin.stopAnimation(data)}}SpriteSpin.registerModule("drag",{mousedown:dragStart,mousemove:drag,mouseup:dragEnd,documentmousemove:drag,documentmouseup:dragEnd,touchstart:dragStart,touchmove:drag,touchend:dragEnd,touchcancel:dragEnd}),SpriteSpin.registerModule("move",{mousemove:function(e,data){dragStart.call(this,e,data),drag.call(this,e,data)},mouseleave:dragEnd,touchstart:dragStart,touchmove:drag,touchend:dragEnd,touchcancel:dragEnd})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function start(e,data){data.loading||data.dragging||!data.stage.is(":visible")||(SpriteSpin.updateInput(e,data),data.dragging=!0,data.animate=!0,SpriteSpin.setAnimation(data))}function stop(e,data){data.dragging=!1,SpriteSpin.resetInput(data),SpriteSpin.stopAnimation(data)}function update(e,data){if(data.dragging){SpriteSpin.updateInput(e,data);var half,delta,target=data.target,offset=target.offset();"horizontal"===data.orientation?(half=target.innerWidth()/2,delta=(data.currentX-offset().left-half)/half):(half=data.height/2,delta=(data.currentY-offset().top-half)/half),data.reverse=0>delta,delta=0>delta?-delta:delta,data.frameTime=80*(1-delta)+20,("horizontal"===data.orientation&&data.dX<data.dY||"vertical"===data.orientation&&data.dX<data.dY)&&e.preventDefault()}}SpriteSpin.registerModule("hold",{mousedown:start,mousemove:update,mouseup:stop,mouseleave:stop,touchstart:start,touchmove:update,touchend:stop,touchcancel:stop,onFrame:function(){$(this).spritespin("api").startAnimation()}})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function init(e,data){data.swipeFling=data.swipeFling||10,data.swipeSnap=data.swipeSnap||.5}function start(e,data){data.loading||data.dragging||(SpriteSpin.updateInput(e,data),data.dragging=!0)}function update(e,data){if(data.dragging){SpriteSpin.updateInput(e,data);var frame=data.frame,lane=data.lane;SpriteSpin.updateFrame(data,frame,lane)}}function end(e,data){if(data.dragging){data.dragging=!1;var dS,dF,frame=data.frame,lane=data.lane,snap=data.swipeSnap,fling=data.swipeFling;"horizontal"===data.orientation?(dS=data.ndX,dF=data.ddX):(dS=data.ndY,dF=data.ddY),dS>snap||dF>fling?frame=data.frame-1:(-snap>dS||-fling>dF)&&(frame=data.frame+1),SpriteSpin.resetInput(data),SpriteSpin.updateFrame(data,frame,lane),SpriteSpin.stopAnimation(data)}}SpriteSpin.registerModule("swipe",{onLoad:init,mousedown:start,mousemove:update,mouseup:end,mouseleave:end,touchstart:start,touchmove:update,touchend:end,touchcancel:end})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function drawSprite(data){var index=data.lane*data.frames+data.frame,x=data.frameWidth*(index%data.framesX),y=data.frameHeight*floor(index/data.framesX);if("canvas"===data.renderer){var w=data.canvas[0].width/data.canvasRatio,h=data.canvas[0].height/data.canvasRatio;return data.context.clearRect(0,0,w,h),void data.context.drawImage(data.images[0],x,y,data.frameWidth,data.frameHeight,0,0,w,h)}x=-floor(x*data.scaleWidth),y=-floor(y*data.scaleHeight),"background"===data.renderer?data.stage.css({"background-image":["url('",data.source[0],"')"].join(""),"background-position":[x,"px ",y,"px"].join("")}):$(data.images).css({top:y,left:x,"max-width":"initial"})}function drawFrames(data){var index=data.lane*data.frames+data.frame,img=data.images[index];if("canvas"===data.renderer){if(img&&img.complete!==!1){var w=data.canvas[0].width/data.canvasRatio,h=data.canvas[0].height/data.canvasRatio;data.context.clearRect(0,0,w,h),data.context.drawImage(img,0,0,w,h)}}else"background"===data.renderer?data.stage.css({"background-image":["url('",data.source[index],"')"].join(""),"background-position":[0,"px ",0,"px"].join("")}):($(data.images).hide(),$(data.images[index]).show())}var floor=Math.floor;SpriteSpin.registerModule("360",{onLoad:function(e,data){var w,h;if(data.width&&data.frameWidth?data.scaleWidth=data.width/data.frameWidth:data.scaleWidth=1,data.height&&data.frameHeight?data.scaleHeight=data.height/data.frameHeight:data.scaleHeight=1,data.sourceIsSprite=1===data.images.length,data.stage.empty().css({"background-image":"none"}).show(),"canvas"===data.renderer){var w=data.canvas[0].width/data.canvasRatio,h=data.canvas[0].height/data.canvasRatio;data.context.clearRect(0,0,w,h),data.canvas.show()}else if("background"===data.renderer){data.sourceIsSprite?(w=floor(data.sourceWidth*data.scaleWidth),h=floor(data.sourceHeight*data.scaleHeight)):(w=floor(data.frameWidth*data.scaleWidth),h=floor(data.frameHeight*data.scaleHeight));var background=[w,"px ",h,"px"].join("");data.stage.css({"background-repeat":"no-repeat","-webkit-background-size":background,"-moz-background-size":background,"-o-background-size":background,"background-size":background})}else"image"===data.renderer&&(data.sourceIsSprite?(w=floor(data.sourceWidth*data.scaleWidth),h=floor(data.sourceHeight*data.scaleHeight)):w=h="100%",$(data.images).appendTo(data.stage).css({width:w,height:h,position:"absolute"}))},onDraw:function(e,data){data.sourceIsSprite?drawSprite(data):drawFrames(data)}})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function init(e,data){var scope=scopeFrom(data),css=SpriteSpin.calculateInnerLayout(data);scope.canvas[0].width=data.width*data.canvasRatio,scope.canvas[0].height=data.height*data.canvasRatio,scope.canvas.css(css).show(),scope.context.scale(data.canvasRatio,data.canvasRatio),data.target.append(scope.canvas)}function onFrame(e,data){var scope=scopeFrom(data);trackFrame(data,scope),null==scope.timeout&&loop(data,scope)}function scopeFrom(data){data.blurScope=data.blurScope||{};var scope=data.blurScope;return scope.canvas=scope.canvas||$("<canvas class='blur-layer'></canvas>"),scope.context=scope.context||scope.canvas[0].getContext("2d"),scope.steps=scope.steps||[],scope.fadeTime=Math.max(data.blurFadeTime||200,1),scope.frameTime=Math.max(data.blurFrameTime||data.frameTime,16),scope.trackTime=null,scope.cssBlur=!!data.blurCss,scope}function trackFrame(data,scope){var d=Math.abs(data.frame-data.lastFrame);d>=data.frames/2&&(d=data.frames-d),scope.steps.unshift({index:data.lane*data.frames+data.frame,live:1,step:scope.frameTime/scope.fadeTime,d:d})}function removeOldFrames(frames){toRemove.length=0;var i;for(i=0;i<frames.length;i+=1)frames[i].alpha<=0&&toRemove.push(i);for(i=0;i<toRemove.length;i+=1)frames.splice(toRemove[i],1)}function loop(data,scope){scope.timeout=window.setTimeout(function(){tick(data,scope)},scope.frameTime)}function killLoop(data,scope){window.clearTimeout(scope.timeout),scope.timeout=null}function applyCssBlur(canvas,d){d=Math.min(Math.max(d/2-4,0),1.5),canvas.css({"-webkit-filter":"blur("+d+"px)",filter:"blur("+d+"px)"})}function drawFrame(data,scope,step){var context=scope.context,index=step.index,img=data.sourceIsSprite?data.images[0]:data.images[index];if(!(step.alpha<=0)&&img&&img.complete!==!1)if(context.globalAlpha=step.alpha,data.sourceIsSprite){var x=data.frameWidth*(index%data.framesX),y=data.frameHeight*Math.floor(index/data.framesX);context.drawImage(img,x,y,data.frameWidth,data.frameHeight,0,0,data.width,data.height)}else context.drawImage(img,0,0,data.width,data.height)}function tick(data,scope){if(killLoop(data,scope),scope.context){var i,step,context=scope.context,d=0;for(context.clearRect(0,0,data.width,data.height),i=0;i<scope.steps.length;i+=1)step=scope.steps[i],step.live=Math.max(step.live-step.step,0),step.alpha=Math.max(step.live-.25,0),drawFrame(data,scope,step),d+=step.alpha+step.d;scope.cssBlur&&applyCssBlur(scope.canvas,d),removeOldFrames(scope.steps),scope.steps.length&&loop(data,scope)}}var toRemove=[];SpriteSpin.registerModule("blur",{onLoad:init,onFrameChanged:onFrame})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function init(e,data){data.easeAbortAfterMs=max(data.easeAbortAfterMs||250,0),data.easeDamping=max(min(data.easeDamping||.9,.999),0),data.easeSamples=max(data.easeSamples||5,1),data.easeUpdateTime=max(data.easeUpdateTime||data.frameTime,16),data.easeScope={samples:[],steps:[]}}function update(e,data){data.dragging&&(killLoop(data,data.easeScope),sampleInput(data,data.easeScope))}function end(e,data){for(var last,sample,ease=data.easeScope,samples=ease.samples,lanes=0,frames=0,time=0,i=0;i<samples.length;i+=1)if(sample=samples[i],last){var dt=sample.time-last.time;if(dt>data.easeAbortAfterMs)return lanes=frames=time=0,killLoop(data,ease);frames+=sample.frame-last.frame,lanes+=sample.lane-last.lane,time+=dt,last=sample}else last=sample;samples.length=0,time&&(ease.ms=data.easeUpdateTime,ease.lane=data.lane,ease.lanes=0,ease.laneStep=lanes/time*ease.ms,ease.frame=data.frame,ease.frames=0,ease.frameStep=frames/time*ease.ms,loop(data,ease))}function sampleInput(data,ease){for(ease.samples.push({time:(new Date).getTime(),frame:data.dragFrame,lane:data.dragLane});ease.samples.length>data.easeSamples;)ease.samples.shift()}function killLoop(data,ease){null!=ease.timeout&&(window.clearTimeout(ease.timeout),ease.timeout=null)}function loop(data,ease){ease.timeout=window.setTimeout(function(){tick(data,ease)},ease.ms)}function tick(data,ease){ease.lanes+=ease.laneStep,ease.frames+=ease.frameStep,ease.laneStep*=data.easeDamping,ease.frameStep*=data.easeDamping;var frame=Math.floor(ease.frame+ease.frames),lane=Math.floor(ease.lane+ease.lanes);SpriteSpin.updateFrame(data,frame,lane),data.dragging?killLoop(data,ease):Math.abs(ease.frameStep)>.005||Math.abs(ease.laneStep)>.005?loop(data,ease):killLoop(data,ease)}var max=Math.max,min=Math.min;SpriteSpin.registerModule("ease",{onLoad:init,mousemove:update,mouseup:end,mouseleave:end,touchmove:update,touchend:end,touchcancel:end})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function load(e,data){data.galleryImages=[],data.galleryOffsets=[],data.gallerySpeed=500,data.galleryOpacity=.25,data.galleryFrame=0,data.galleryStage=data.galleryStage||$("<div/>"),data.stage.prepend(data.galleryStage),data.galleryStage.empty();var i,size=0;for(i=0;i<data.source.length;i+=1){var img=$("<img src='"+data.source[i]+"'/>");data.galleryStage.append(img),data.galleryImages.push(img);var scale=data.height/img[0].height;data.galleryOffsets.push(-size+(data.width-img[0].width*scale)/2),size+=data.width,img.css({"max-width":"initial",opacity:data.galleryOpacity,width:data.width,height:data.height})}var css=SpriteSpin.calculateInnerLayout(data);data.galleryStage.css(css).css({width:size}),data.galleryImages[data.galleryFrame].animate({opacity:1},data.gallerySpeed)}function draw(e,data){data.galleryFrame===data.frame||data.dragging?(data.dragging||data.dX!=data.gallerydX)&&(data.galleryDX=data.DX,data.galleryDDX=data.DDX,data.galleryStage.stop(!0,!0).animate({left:data.galleryOffsets[data.frame]+data.dX})):(data.galleryStage.stop(!0,!1),data.galleryStage.animate({left:data.galleryOffsets[data.frame]},data.gallerySpeed),data.galleryImages[data.galleryFrame].animate({opacity:data.galleryOpacity},data.gallerySpeed),data.galleryFrame=data.frame,data.galleryImages[data.galleryFrame].animate({opacity:1},data.gallerySpeed))}SpriteSpin.registerModule("gallery",{onLoad:load,onDraw:draw})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";var floor=Math.floor;SpriteSpin.registerModule("panorama",{onLoad:function(e,data){data.stage.empty().show(),data.frames=data.sourceWidth,"horizontal"===data.orientation?(data.scale=data.height/data.sourceHeight,data.frames=data.sourceWidth):(data.scale=data.width/data.sourceWidth,data.frames=data.sourceHeight);var w=floor(data.sourceWidth*data.scale),h=floor(data.sourceHeight*data.scale),background=[w,"px ",h,"px"].join("");data.stage.css({"max-width":"initial","background-image":["url('",data.source[0],"')"].join(""),"background-repeat":"repeat-both","-webkit-background-size":background,"-moz-background-size":background,"-o-background-size":background,"background-size":background})},onDraw:function(e,data){var x=0,y=0;"horizontal"===data.orientation?x=-floor(data.frame%data.frames*data.scale):y=-floor(data.frame%data.frames*data.scale),data.stage.css({"background-position":[x,"px ",y,"px"].join("")})}})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin),function($,SpriteSpin){"use strict";function onCreate(e,data){data.zoomStage||(data.zoomStage=$("<div class='spritezoom-stage'></div>").css({width:"100%",height:"100%",top:0,left:0,bottom:0,right:0,position:"absolute"}).appendTo(data.target).hide())}function onDestroy(e,data){data.zoomStage&&data.zoomStage.remove()}function updateInput(e,data){e.preventDefault(),data.dragging=!1,!e.touches&&e.originalEvent&&(e.touches=e.originalEvent.touches);var x,y,dx,dy;e.touches&&e.touches.length?(x=e.touches[0].clientX||0,y=e.touches[0].clientY||0):(x=e.clientX||0,y=e.clientY||0),x/=data.width,y/=data.height,null==data.zoomPX&&(data.zoomPX=x,data.zoomPY=y),null==data.zoomX&&(data.zoomX=x,data.zoomY=y),dx=x-data.zoomPX,dy=y-data.zoomPY,data.zoomPX=x,data.zoomPY=y,e.type.match(/touch/)&&(dx=-dx,dy=-dy),data.zoomX=SpriteSpin.clamp(data.zoomX+dx,0,1),data.zoomY=SpriteSpin.clamp(data.zoomY+dy,0,1),SpriteSpin.updateFrame(data)}function onDraw(e,data){var index=data.lane*data.frames+data.frame,source=(data.zoomSource||data.source)[index];if(!source)return void $.error("'zoomSource' option is missing or it contains unsufficient number of frames.");
var x=data.zoomX,y=data.zoomY;(null==x||null==y)&&(x=data.zoomX=.5,y=data.zoomY=.5),x=100*x|0,y=100*y|0,data.zoomStage.css({"background-repeat":"no-repeat","background-image":["url('",source,"')"].join(""),"background-position":[x,"% ",y,"%"].join("")})}function onClick(e,data){e.preventDefault();var clickTime=(new Date).getTime();if(!data.zoomClickTime)return void(data.zoomClickTime=clickTime);var timeDelta=clickTime-data.zoomClickTime,doubleClickTime=data.zoomDoubleClickTime||500;return timeDelta>doubleClickTime?void(data.zoomClickTime=clickTime):(data.zoomClickTime=0,void($(this).spritespin("api").toggleZoom()&&updateInput(e,data)))}function onMove(e,data){data.zoomStage.is(":visible")&&updateInput(e,data)}function toggleZoom(){var data=this.data;return data.zoomStage?data.zoomStage.is(":visible")?(data.zoomStage.fadeOut(),data.stage.fadeIn(),!1):(data.zoomStage.fadeIn(),data.stage.fadeOut(),!0):($.error("zoom module is not initialized or is not available."),!1)}SpriteSpin.registerModule("zoom",{mousedown:onClick,touchstart:onClick,mousemove:onMove,touchmove:onMove,onInit:onCreate,onDestroy:onDestroy,onDraw:onDraw}),SpriteSpin.extendApi({toggleZoom:toggleZoom})}(window.jQuery||window.Zepto||window.$,window.SpriteSpin);