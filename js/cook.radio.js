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
		var 
			$this = $(this),
			label = $('[data-name-label="'+$this.data('name')+'"]');
			
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
		// Find label
		if(label.length) {
			label.on('click', function() {
				$this.trigger('click');
			})
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