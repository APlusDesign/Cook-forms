/**
 * Fuck forms
 * This plugin allows you to use a custom Checkboxs, Radio buttons, Textboxes, textareas and selects. Its very simple, small and easy to use.
 *
 *	Usage
 *  $('div.form').cookforms(); 
 * 	var myPluginReference = $('#cookform1').data('cookforms');
 * 	myPluginReference.getAllFormElements(); 
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
							radioSelectClass: 'radio-selected',
							checkboxSelectClass: 'checkbox-selected',
							registerPlugins: {
								textbox: null,
								textarea: null,
								radio: 'cookradio',
								checkbox: 'cookcheckbox',
								select: 'selectBox'
							},
							applyStyles: true
						}, options || {});
		
		// Public methods
		// They mostly just return forms objs and form objs collections
		
		// no formatting
		this.formElements = function(grouped)
		{
			return form.find('[data-type="textbox"], [data-type="textarea"], [data-type="select"], [data-type="radio"], [data-type="checkbox"], [data-type="submit"], [data-type="reset"]');
		};
		// Return all form elements
		this.getAllFormElements = function(grouped)
		{
			var selected = form.find('[data-type="textbox"], [data-type="textarea"], [data-type="select"], [data-type="radio"], [data-type="checkbox"], [data-type="submit"], [data-type="reset"]');
			return formatObjects(selected, grouped);
		};
		// Return all form elements that are valid for a form submission
		this.getAllFormElementsWithValue = function(grouped)
		{
			var selected = form.find('[data-type="textbox"], [data-type="textarea"], [data-type="select"], [data-selected="true"]');
			return formatObjects(selected, grouped);
		};
		// Public method
		this.getAllSelectedFormElements = function()
		{
			var selected = form.find('[data-selected="true"]');
			return formatObjects(selected);
		};
		// Public method
		this.getFormSubmit = function()
		{
			return form.find('[data-type="submit"]');
		};
		// Public method
		this.getFormReset = function()
		{
			return form.find('[data-type="reset"]');
		};
		// Reseting form removes all data refreshing page resets for to original defaults
		this.formReset = function()
		{
			this.textReset(form.find('[data-type="textbox"], [data-type="textarea"]'))
			this.radioCheckReset(form.find('[data-type="radio"], [data-type="checkbox"]'))
			this.selectReset(form.find('[data-type="select"]'))
		};
			// TODO :// reset functions need to be part of the elements plugin else it defeats purpose of allowing different ones
			// Resets textboxes and textareas
			this.textReset = function(objs)
			{
				var length = objs.length;
				for(var i=0;i<length;i++) {
					var tmp = $(objs[i]);
					tmp.html('');
				}		
			};
			// Resets selects 
			this.selectReset = function(objs)
			{
				var length = objs.length;
				for(var i=0;i<length;i++) {
					var tmp = $(objs[i])
					tmp.selectBox('reset');
				}		
			};
			// Resets radios and checkboxes 
			this.radioCheckReset = function(objs)
			{
				var length = objs.length;
				for(var i=0;i<length;i++) {
					var tmp = $(objs[i])
					tmp
						.data({'selected': null})
						.attr('data-selected', null)
						.removeClass(
							(tmp.data('type') == 'radio' ? settings.radioSelectClass : settings.checkboxSelectClass)
						)
				}		
			};
			
		// Private method: format form objects for actual use
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
		
		// Simple check for elements and existing plugin namespace
		var runPlugin = function(objs, plugin) {
			
			if(objs.length && plugin) {
				objs[plugin]();
			}
		};
		
		this.init = function () {
			
			// Applies a named style based off the data-type
			// avoids css selectors like div[data-type="radio"] in favor of .radio
			if(settings.applyStyles) {
				this.formElements().each(function() {
					var el = $(this);
					el.addClass(el.data('type'))
				})
			}
			
			/* Runs the associated plugin for each element, which can actually be over-ridden via settings */
			runPlugin(form.find('div[data-type="textbox"]'), settings.registerPlugins.textbox)
			runPlugin(form.find('div[data-type="textarea"]'), settings.registerPlugins.textarea)
			runPlugin(form.find('div[data-type="checkbox"]'), settings.registerPlugins.checkbox)
			runPlugin(form.find('div[data-type="radio"]'), settings.registerPlugins.radio)
			runPlugin(form.find('ul[data-type="select"]'), settings.registerPlugins.select)
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
 * Fuck forms element plugins
 * Use whatever plugins you want to provide functionality to your form elements, these are provided as working examples, you may write your own at will
 *
 *	
 * 
 * @author Simon Ilett
 * @version 1.0
 * @date 7/03/2013
 */
 

// Checkboxes 
(function($) {
  $.fn.cookcheckbox = function(opts) {
	
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
	});
  }
})(jQuery);


// Radio buttons
(function($) {
  $.fn.cookradio = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-radio',	
		selectedCls: 'radio-selected'
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
					$(this).data('selected', null).attr('data-selected', null).removeClass(options.selectedCls);
				});
				$this.data('selected', 'true').attr('data-selected', 'true').addClass(options.selectedCls);
			}
		});
		if($this.data('selected')) {
			  $this.addClass(options.selectedCls);    		
		}    
	});
  }
})(jQuery);


// Textbox (does absolutely nothing)
(function($) {
  $.fn.cooktextbox = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-textbox', 
		elSelectedClass: 'cook-textbox-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Checkbox logic
	return this.each(function() {
		var $this = $(this);
	});
  }
})(jQuery);


// Textarea (does absolutely nothing)
(function($) {
  $.fn.cooktextarea = function(opts) {
	
	// Options
	var options = { 
		elClass: 'cook-textarea', 
		elSelectedClass: 'cook-textarea-selected'
	};
	options = jQuery.extend(opts, options);
	
	// Checkbox logic
	return this.each(function() {
		var $this = $(this);
	});
  }
})(jQuery);


// Selects (are complex so see cook.selectBox.js)