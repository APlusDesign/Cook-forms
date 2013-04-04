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