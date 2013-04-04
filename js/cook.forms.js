/**
 * Cook forms - Making forms more digestible
 *
 * This plugin allows you to use custom; checkboxs, radio buttons, textboxes, textareas and selects. 
 * This plugin is a wrapper that allows you retrieve your custom form elements and values in a nicely formatted JSON object
 * This plugin can also bind all your form reset values together in one place
 *
 *	Example usage
 *  $('div.form').cookforms(); 
 * 	var myPluginReference = $('#cookform1').data('cookforms');
 * 	myPluginReference.getAllFormElements(); 
 *  myPluginReference.formReset();
 *
 * 
 * @author Simon Ilett
 * @version 1.0
 * @date 2/28/2013
 */
 
(function($){
   var CookForms = function(element, options)
   {
		var 
			form 		= $(element),
			$this 		= this,
			settings 	= $.extend({
							registerPlugins: {
								textbox: 'cookTextbox',
								textarea: 'cookTextarea',
								radio: 'cookRadio',
								checkbox: 'cookCheckbox',
								select: 'selectBox'
							},
							applyStyles: true
						}, options || {});
		
		// Public methods
		// They mostly just return forms objs and form objs collections
		
		// no cook form formatting
		this.formElements = function()
		{
			return form.find('[data-type="textbox"], [data-type="textarea"], [data-type="select"], [data-type="radio"], [data-type="checkbox"], [data-type="submit"], [data-type="reset"]');
		};
		// Return all form elements
		this.getAllFormElements = function(grouped)
		{
			var tmp = this.formElements();
			return formatObjects(tmp, grouped);
		};
		// Return all form elements that are valid for a form submission
		this.getAllFormElementsWithValue = function(grouped)
		{
			var tmp = form.find('[data-type="textbox"], [data-type="textarea"], [data-type="select"], [data-selected="true"]');
			return formatObjects(tmp, grouped);
		};
		// Will return selected radios and checkboxes
		this.getAllSelectedFormElements = function(grouped)
		{
			var tmp = form.find('[data-selected="true"]');
			return formatObjects(tmp, grouped);
		};
		// Will return json object of all of type 
		this.getFormElement = function(type, grouped)
		{
			var tmp = form.find('[data-selected="'+type+'"]');
			return formatObjects(tmp, grouped);
		};
		// If form has a submit button return it
		this.getFormSubmit = function()
		{
			return form.find('[data-type="submit"]');
		};
		// If form has a reset button return it
		this.getFormReset = function()
		{
			return form.find('[data-type="reset"]');
		};
		
		// Reseting a form removes all data and states 
		// Refreshing page resets form to original defaults
		this.formReset = function()
		{
			// I've exposed these as public methods so you can reset as you like
			// This is just a method to reset all at once.
			this.textboxReset();
			this.textareaReset();
			this.checkboxReset();
			this.radioReset();
			this.selectReset();
		};
		// Resets textboxes : uses textboxes plugin, public reset() 
		this.textboxReset = function()
		{
			resetHelper(form.find('[data-type="textbox"]'));		
		};
		// Resets textareas : uses textareas plugin, public reset() 
		this.textareaReset = function()
		{
			resetHelper(form.find('[data-type="textarea"]'));		
		};
		// Resets radios : uses radios plugin, public reset() 
		this.radioReset = function()
		{
			resetHelper(form.find('[data-type="radio"]'));		
		};
		// Resets checkboxes : uses checkboxes plugin, public reset() 
		this.checkboxReset = function()
		{
			resetHelper(form.find('[data-type="checkbox"]'));		
		};
		// Resets selects : uses selects plugin, public reset() 
		this.selectReset = function()
		{
			resetHelper(form.find('[data-type="select"]'));		
		};
		
		
		// Loops through objects and looks for their plugins reset method, calls it if found
		var resetHelper = function(objs)
		{
			var length = objs.length;
			for(var i=0;i<length;i++) {
				var 
					tmp = $(objs[i]),
					data = tmp.data();
				if(data[data.pluginName].reset) {
					data[data.pluginName].reset();
				} else {
					console.log(data.name + ' has no reset method in ' + data.pluginName + ' plugin');
				}
			}	
		};	
		
		// Private method: format form objects for actual output in JSON object
		var formatObjects = function(objs, grouped)
		{
			var 
				length = objs.length,
				formObjs = {};
			
			for(var i=0;i<length;i++) {
				var 
					tmp 	= $(objs[i]),
					elData 	= tmp.data(),
					elObj 	= {};
				
				elObj.type = elData.type;
				elObj.element = tmp;
				if(elObj.type == 'textbox' || elObj.type == 'textarea') {
					elObj.value = tmp.text();
					elObj.html = tmp.html();
				}
				if(elObj.type == 'checkbox' || elObj.type == 'radio') {
					elObj.selected = (elData.selected ? elData.selected : null);
					elObj.value = elData.value;
				}	
				if(elObj.type == 'select') {
					elObj.value = elData.value;
				}	
				if(grouped && elData.grouping) {
					if(!formObjs[elData.grouping]) {
						formObjs[elData.grouping] = {};
					}
					formObjs[elData.grouping][elData.name] = elObj;	
				} else {
					formObjs[elData.name] = elObj;
				}	
			}
			return formObjs;
		};
		
		// Private method: Simple check for elements and existing plugin namespace
		var runPlugin = function(type, plugin) {
			var objs = form.find('[data-type="'+type+'"]')
			if(objs.length && plugin) {
				objs[plugin]();
				objs.data('pluginName', plugin);
			}
		};
		
		// Private method: Applies a named style based off the data-type
		var applyClassName = function() {
			if(settings.applyStyles) {
				$this.formElements().each(function() {
					var el = $(this);
					el.addClass(el.data('type'));
				})
			}
		};
		
		this.init = function () {
			// Avoids CSS selectors like div[data-type="radio"] in your CSS in favor of .radio, .checkbox, .textarea, .textbox, .select
			applyClassName();
			/* Runs the associated default plugin for each element, which can be over-ridden via settings/options */
			runPlugin("textbox", settings.registerPlugins.textbox);
			runPlugin("textarea", settings.registerPlugins.textarea);
			runPlugin("checkbox", settings.registerPlugins.checkbox);
			runPlugin("radio", settings.registerPlugins.radio);
			runPlugin("select", settings.registerPlugins.select);
		};
		
		// Create the correct scope for this plugin
		this.init();
   };

   $.fn.cookforms = function(options)
   {
	   return this.each(function()
	   {
			// obj becomes the object the plugin is attached to.
			var obj = $(this);
			// Return if obj already has a plugin instance
			if (obj.data('cookforms')) return;
			// pass options to plugin constructor
			var cookforms = new CookForms(obj, options);
			// Store plugin object in obj's data
			obj.data('cookforms', cookforms);
	   });
   };
})(jQuery);
























/**
 * Cook forms element plugins
 * Use whatever plugins you want to provide functionality to your form elements, these are provided as working examples, you may write your own at will
 *
 * IMPORTANT: All plugins must have a public reset method, else the form can't be reset, it will fail with a console log if your plugins don't have reset methods..
 */
 
// Hastily written plugin for checkbox functionality
// Checkboxes 
(function($) {
  $.fn.cookCheckbox = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-checkbox', 
		elSelectedClass: 'checkbox-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Checkbox logic
	return this.each(function() {
		var $this = $(this);
		$this.addClass(options.elClass)
		$this.on('click', function() {
			var $this = $(this);
			if($this.data('selected')) { 
				$this.data('selected', null).attr('data-selected', null).removeClass(options.elSelectedClass);
			} else {	
				$this.data('selected', 'true').attr('data-selected', 'true').addClass(options.elSelectedClass);
			}
		});
		if ($this.data('selected')) {
			$this.addClass(options.elSelectedClass);    		
		}
		this.reset = function() {
			$this
				.data({'selected': null})
				.attr('data-selected', null)
				.removeClass(options.elSelectedClass)	
		}
		$this.data('cookCheckbox', this)
	});
  }
})(jQuery);


// Hastily written plugin for radio functionality
// Radio buttons
(function($) {
  $.fn.cookRadio = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-radio',	
		elSelectedClass: 'radio-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Radio logic
	return this.each(function() {
		var $this = $(this);
		$this.addClass(options.elClass);
		$this.on('click', function() {
			var $this = $(this);
			// radio button may contain groups! - so check for group
			if(!$this.data('selected')) { 
				$('div[data-grouping="'+$this.data('grouping')+'"]').each(function(e, v) {
					$(this).data('selected', null).attr('data-selected', null).removeClass(options.elSelectedClass);
				});
				$this.data('selected', 'true').attr('data-selected', 'true').addClass(options.elSelectedClass);
			}
		});
		if($this.data('selected')) {
			  $this.addClass(options.elSelectedClass);    		
		}    
		this.reset = function() {
			$this
				.data({'selected': null})
				.attr('data-selected', null)
				.removeClass(options.elSelectedClass)	
		}
		$this.data('cookRadio', this)
	});
  }
})(jQuery);


// Hastily written plugin for textbox functionality
// Textbox (does absolutely nothing)
(function($) {
  $.fn.cookTextbox = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-textbox', 
		elSelectedClass: 'cook-textbox-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Checkbox logic
	return this.each(function() {
		var $this = $(this);
		// Reset method
		this.reset = function() {
			$this.html('').data('value', null);;
		}
		$this.data('cookTextbox', this)
	});
  }
})(jQuery);


// Hastily written plugin for textarea functionality
// Textarea (does absolutely nothing)
(function($) {
  $.fn.cookTextarea = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-textarea', 
		elSelectedClass: 'cook-textarea-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Checkbox logic
	return this.each(function() {
		var $this = $(this);
		// Reset method
		this.reset = function() {
			$this.html('').data('value', null);
		}
		$this.data('cookTextarea', this)
	});
  }
})(jQuery);


// Selects (are complex so see cook.selectBox.js)