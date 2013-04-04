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
