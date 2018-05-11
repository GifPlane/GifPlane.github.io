
(function(root,factory) {
	if(typeof define === 'function' && define.amd){
		define([], function() {return factory.call(root);});
	}else{
		root.shaderUtils = factory.call(root);
	}
}(this, function(){

	"use strict"; //严格模式

	var topWindow = this;

	/**
	* Wrapped logging function.
	* @param {string} msg The message to log.
	*/
	function error(msg) {
		if (topWindow.console) {
		  if (topWindow.console.error) {
		    topWindow.console.error(msg);
		  } else if (topWindow.console.log) {
		    topWindow.console.log(msg);
		  }
		}
	}

	//创建并编译shader
	function createShader(gl, type, source) {
	  var shader = gl.createShader(type);
	  gl.shaderSource(shader, source);
	  gl.compileShader(shader);
	  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	  if (success) {
	    return shader;
	  }

	  console.log(gl.getShaderInfoLog(shader));
	  gl.deleteShader(shader);
	}

	// //创建和连接着色器程序
	// function createProgram(gl, vertexShader, fragmentShader) {
	//   var program = gl.createProgram();
	//   gl.attachShader(program, vertexShader);
	//   gl.attachShader(program, fragmentShader);
	//   gl.linkProgram(program);
	//   var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	//   if (success) {
	//     return program;
	//   }

	//   console.log(gl.getProgramInfoLog(program));
	//   gl.deleteProgram(program);
	// }

	/**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @memberOf module:webgl-utils
   */
	function createProgram(
      gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
		var errFn = opt_errorCallback || error;
		var program = gl.createProgram();
		shaders.forEach(function(shader) {
		  gl.attachShader(program, shader);
		});
		if (opt_attribs) {
		  opt_attribs.forEach(function(attrib, ndx) {
		    gl.bindAttribLocation(
		        program,
		        opt_locations ? opt_locations[ndx] : ndx,
		        attrib);
		  });
		}
		gl.linkProgram(program);

		// Check the link status
		var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
		    // something went wrong with the link
		    var lastError = gl.getProgramInfoLog(program);
		    errFn("Error in program linking:" + lastError);

		    gl.deleteProgram(program);
		    return null;
		}
		return program;
  	}

	/**
   * Loads a shader.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} shaderSource The shader source.
   * @param {number} shaderType The type of shader.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
	function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
		var errFn = opt_errorCallback || error;
		//创建shader对象
		var shader = gl.createShader(shaderType);
		//加载shader源代码
		gl.shaderSource(shader, shaderSource);
		//编译shader
		gl.compileShader(shader);

		//检查编译状态
		var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if(!compiled){
			var lastError = gl.getShaderInfoLog(shader);
			errFn("*** Error compiling shader " + shader + "':" + lastError);
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}


	function createProgramFromScript(gl, scriptId, opt_shaderType, opt_errorCallback){
		var shaderSource = "";
		var shaderType;
		var shaderScript = document.getElementById(scriptId);
		if(!shaderScript) {
			throw("*** Error: unknow script element" + scriptId);
		}
		shaderSource = shaderScript.text;

		if(!opt_shaderType) {
			if(opt_shaderType.type === "x-shader/x-vertex") {
				shaderType = gl.VERTEX_SHADER;
			}else if(shaderScript.type === "x-shader/x-fragment") {
				shaderType = gl.FRAGMENT_SHADER;
			}else if(shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
				throw("*** Error : unknow shader type");
			}
		}

		return loadShader(gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType, opt_errorCallback);
	}

	var defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
  ];

  	/**
   * Creates a program from 2 script tags.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
	function createProgramFromScripts(gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback){
		var shaders = [];
		for(var ii = 0; ii<shaderScriptIds.length; ++ii) {
			shaders.push(createProgramFromScript(gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
		}
		return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
	}

	return {
		createShader:createShader,
		createProgram:createProgram,
		loadShader:loadShader,
		createProgramFromScript:createProgramFromScript,
		createProgramFromScripts:createProgramFromScripts,
	};

}))