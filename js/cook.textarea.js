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