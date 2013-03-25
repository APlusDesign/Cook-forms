/*
 *
 * Notes: 
 * The initial list element must have a tabindex to make the focus and blur events work on your fake select in chrome.
 *
 */
 
if (jQuery)(function($) {
	$.extend($.fn, {
		selectBox: function(method, data) {
			var typeTimer, typeSearch = '',
				isMac = navigator.platform.match(/mac/i);
			//
			// Private methods
			//
			
			
			var init = function(select, data) {
					var options;
					// Disable for iOS devices (their native controls are more suitable for a touch device)
					//if (navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i)) return false;
					
						
					// Don't re-implement
					var select = $(select);
					if (select.data('selectBox-control')) { 
						return false;
					}
					
					var control 	= $('<a class="selectBox" />'),
						label 		= select.parent().find('.label'),
						inline 		= select.data('multiple') || parseInt(select.data('size')) > 1,
						settings 	= data || {};
					
					// Set up the control 
					control
						.addClass(select.attr('class'))
						.attr({
							'title': select.attr('title') || '',
							'tabindex': parseInt(select.attr('tabindex'))
						})
						.css('width', select.outerWidth())
						.on('focus.selectBox', function() {
							if (this !== document.activeElement && document.body !== document.activeElement) {
								$(document.activeElement).blur();
							}	
							if (helperSelectBoxActive(control)) {
								return;
							}	
							control.addClass('selectBox-active');
							select.trigger('focus');
						})
						.on('blur.selectBox', function() {
							if (!helperSelectBoxActive(control)) {
								return;
							}
							control.removeClass('selectBox-active');
							select.trigger('blur');
						});
					// Some extra binds	
					if (!$(window).data('selectBox-bindings')) {
						$(window).data('selectBox-bindings', true)
						.on('scroll.selectBox', hideMenus)
						.on('resize.selectBox', hideMenus);
					}
					// Is select disabled
					if (select.data('disabled')) {
						control.addClass('selectBox-disabled');
					}
					// Focus on control when label is clicked
					if(label.length) {
						label.on('click.selectBox', function(event) {
							control.focus();
							event.preventDefault();
						});
					}	
					
					

					// Generate control
					if (inline) {
						//
						// Inline controls
						//
						options = getOptions(select, 'inline');
						control.append(options).data('selectBox-options', options).addClass('selectBox-inline selectBox-menuShowing').on('keydown.selectBox', function(event) {
							handleKeyDown(select, event);
						}).on('keypress.selectBox', function(event) {
							handleKeyPress(select, event);
						}).on('mousedown.selectBox', function(event) {
							if ($(event.target).is('a.selectBox-inline')) event.preventDefault();
							if (!control.hasClass('selectBox-focus')) control.focus();
						}).insertAfter(select);
						// Auto-height based on size attribute
						if (!select[0].style.height) {
							var size = select.data('size') ? parseInt(select.data('size')) : 5;
							// Draw a dummy control off-screen, measure, and remove it
							var tmp = control.clone().removeAttr('id').css({
								position: 'absolute',
								top: '-9999em'
							}).show().appendTo('body');
							tmp.find('.selectBox-options').html('<li><a>\u00A0</a></li>');
							var optionHeight = parseInt(tmp.find('.selectBox-options a:first').html('&nbsp;').outerHeight());
							tmp.remove();
							control.height(optionHeight * size);
						}
						disableSelection(control);
						
						// Store data for later use and show the control
						select.addClass('selectBox').data('selectBox-control', control).data('selectBox-settings', settings).hide();
						
						// Update label
						var 
							selected 		= select.find('li[data-selected="true"]'),
							selectedLength 	= selected.length;
						
						if(selectedLength) {
							for (var i = 0; i < selectedLength; i++) {
								var tmp = $(selected[i]);
								selectOption(select, tmp.data('clone'), {})
							}	
						} 
					
					} else {
						//
						// Dropdown controls
						//
						var label = $('<span class="selectBox-label" />'),
							arrow = $('<span class="selectBox-arrow" />');
							
						label.attr('class', getLabelClass(select)).text(getLabelText(select));
							
						options = getOptions(select, 'dropdown');
						options.appendTo('body');
						control.data('selectBox-options', options).addClass('selectBox-dropdown').append(label).append(arrow).on('mousedown.selectBox', function(event) {
							if (control.hasClass('selectBox-menuShowing')) {
								hideMenus();
							} else {
								event.stopPropagation();
								// Webkit fix to prevent premature selection of options
								options.data('selectBox-down-at-x', event.screenX).data('selectBox-down-at-y', event.screenY);
								showMenu(select);
							}
						}).on('keydown.selectBox', function(event) {
							handleKeyDown(select, event);
						}).on('keypress.selectBox', function(event) {
							handleKeyPress(select, event);
						}).on('open.selectBox', function(event, triggerData) {
							if (triggerData && triggerData._selectBox === true) return;
							showMenu(select);
						}).on('close.selectBox', function(event, triggerData) {
							if (triggerData && triggerData._selectBox === true) return;
							hideMenus();
						}).insertAfter(select);
						// Set label width
						var labelWidth = control.width() - arrow.outerWidth() - parseInt(label.css('paddingLeft')) - parseInt(label.css('paddingLeft'));
						label.width(labelWidth);
						disableSelection(control);
						
						// Store data for later use and show the control
						select
							.addClass('selectBox')
							.data('selectBox-control', control)
							.data('selectBox-settings', settings)
							.hide();
										
						// Update label
						var 
							selected 	= select.find('[data-selected="true"]'),
							tmp 		= $(select.find(':first'));
						
						if(selected.length) {
							tmp = $(selected[0]);
						} 
						selectOption(select, tmp.data('clone'), {})
						
					}
					
				};
				
				
			var getOptions = function(select, type) {
					
					// Private function to handle recursion in the getOptions function.
					var options,
						_getOptions = function(select, options) {
							// Loop through the set in order of element children.
							select.children('li, ul, option, optgroup').each(function() {
								// If the element is an option, add it to the list.
								if ($(this).is('li') || $(this).is('option')) {
									// Check for a value in the option found.
									if ($(this).length > 0) {
										// Create an option form the found element.
										generateOptions($(this), options);
									} else {
										// No option information found, so add an empty.
										options.append('<li>\u00A0</li>');
									}
								} else {
									// If the element is an option group, add the group and call this function on it.
									var optgroup = $('<li class="selectBox-optgroup" />')
										.text($(this).data('label') || $(this).attr('label'));
									options.append(optgroup);
									options = _getOptions($(this), options);
								}
							});
							// Return the built string
							return options;
						};
						
					switch (type) {
					case 'inline':
						options = $('<ul class="selectBox-options" />');
						options = _getOptions(select, options);
						options.find('a')
						.on('mouseover.selectBox', function(event) {
							addHover(select, $(this).parent());
						})
						.on('mouseout.selectBox', function(event) {
							removeHover(select, $(this).parent());
						})
						.on('mousedown.selectBox', function(event) {
							event.preventDefault(); // Prevent options from being "dragged"
							if (!select.selectBox('control').hasClass('selectBox-active')) select.selectBox('control').focus();
						})
						.on('mouseup.selectBox', function(event) {
							hideMenus();
							selectOption(select, $(this).parent(), event);
						});
						disableSelection(options);
						return options;
					case 'dropdown':
						options = $('<ul class="selectBox-dropdown-menu selectBox-options" />');
						options = _getOptions(select, options);
						options
						.data({'selectBox-select': select})
						.css('display', 'none')
						.appendTo('body')
						.find('a')
							.on('mousedown.selectBox', function(event) {
								event.preventDefault(); // Prevent options from being "dragged"
								if (event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y')) {
									options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
									hideMenus();
								}
							})
							.on('mouseup.selectBox', function(event) {
								if (event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y')) {
									return;
								} else {
									options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
								}
								selectOption(select, $(this).parent());
								hideMenus();
							})
							.on('mouseover.selectBox', function(event) {
								addHover(select, $(this).parent());
							})
							.on('mouseout.selectBox', function(event) {
								removeHover(select, $(this).parent());
							});
						// Inherit classes for dropdown menu
						var classes = select.attr('class') || '';
						if (classes !== '') {
							classes = classes.split(' ');
							for (var i in classes) options.addClass(classes[i] + '-selectBox-dropdown-menu');
						}
						disableSelection(options);
						
						options.data({'originalHeight' : options.height()})
						return options;
					}
				};
			var getLabelClass = function(select) {
					var selected = $(select).find('[data-selected="true"]');
					return ('selectBox-label ' + (selected.attr('class') || '')).replace(/\s+$/, '');
				};
			var getLabelText = function(select) {
					var selected = $(select).find('[data-selected="true"]');
					
					
						var tmp = function () {
							if($(select)[0].nodeName.toLowerCase()=='select') {
								return $(select).find('option:first').text()
							} else {
								return $(select).find('li:first').text()
							}	
						}
					return selected.text() || tmp;
				};
			var setLabel = function(select) {
					select = $(select);
					var control = select.data('selectBox-control');
					if (!control) return;
					control
						.find('.selectBox-label')
						.attr('class', getLabelClass(select))
						.text(getLabelText(select));
				};
			var destroy = function(select) {
					select = $(select);
					var control = select.data('selectBox-control');
					if (!control) return;
					var options = control.data('selectBox-options');
					options.remove();
					control.remove();
					select
						.removeClass('selectBox')
						.removeData('selectBox-control')
						.data('selectBox-control', null)
						.removeData('selectBox-settings')
						.data('selectBox-settings', null)
						.show();
				};
			var refresh = function(select) {
					select = $(select);
					select.selectBox('options', select.html());
				};
			var showMenu = function(select) {
					select = $(select);
					var control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings'),
						options = control.data('selectBox-options');
					if (control.hasClass('selectBox-disabled')) return false;
					hideMenus();
					var 
						borderBottomWidth = isNaN(control.css('borderBottomWidth')) ? 0 : parseInt(control.css('borderBottomWidth')),
						toppos = control.offset().top + control.outerHeight() - borderBottomWidth,
						botmaxpos = toppos + options.data('originalHeight'),
						winHeight = parseInt($(window).height());
					
					
					
					if(select.data('ontop')) {
						toppos = (control.offset().top - 2) - options.height()
					} else {
						// body over
						if(parseInt(botmaxpos) > winHeight) {	
							options.css({
								height: winHeight - (toppos+5) 
							})
						} else {
							options.css({
								height: ''
							})
						}
					}
					/*
					if(parseInt(botmaxpos) > parseInt($(window).height())) {	
						toppos = (control.offset().top - 2) - options.height()
					} 
					*/
					options.width(control.innerWidth()).css({
						top: toppos,
						left: control.offset().left
					});
					if (select.triggerHandler('beforeopen')) return false;
					var dispatchOpenEvent = function() {
							select.triggerHandler('open', {
								_selectBox: true
							});
						};
					// Show menu
					switch (settings.menuTransition) {
					case 'fade':
						options.fadeIn(settings.menuSpeed, dispatchOpenEvent);
						break;
					case 'slide':
						options.slideDown(settings.menuSpeed, dispatchOpenEvent);
						break;
					default:
						options.show(settings.menuSpeed, dispatchOpenEvent);
						break;
					}
					if (!settings.menuSpeed) dispatchOpenEvent();
					// Center on selected option
					var li = options.find('.selectBox-selected:first');
					keepOptionInView(select, li, true);
					addHover(select, li);
					control.addClass('selectBox-menuShowing');
					$(document).on('mousedown.selectBox', function(event) {
						if ($(event.target).parents().andSelf().hasClass('selectBox-options')) return;
						hideMenus();
					});
				};
			var hideMenus = function() {
					if ($(".selectBox-dropdown-menu:visible").length === 0) return;
					$(document).unbind('mousedown.selectBox');
					$(".selectBox-dropdown-menu").each(function() {
						var options = $(this),
							select = options.data('selectBox-select'),
							control = select.data('selectBox-control'),
							settings = select.data('selectBox-settings');
						if (select.triggerHandler('beforeclose')) return false;
						var dispatchCloseEvent = function() {
								select.triggerHandler('close', {
									_selectBox: true
								});
							};
						if (settings) {
							switch (settings.menuTransition) {
							case 'fade':
								options.fadeOut(settings.menuSpeed, dispatchCloseEvent);
								break;
							case 'slide':
								options.slideUp(settings.menuSpeed, dispatchCloseEvent);
								break;
							default:
								options.hide(settings.menuSpeed, dispatchCloseEvent);
								break;
							}
							if (!settings.menuSpeed) dispatchCloseEvent();
							control.removeClass('selectBox-menuShowing');
						} else {
							$(this).hide();
							$(this).triggerHandler('close', {
								_selectBox: true
							});
							$(this).removeClass('selectBox-menuShowing');
						}
					});
				};
			var selectOption = function(select, li, event) {
					select = $(select);
					li = $(li);
					
					var control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings');
					if (control.hasClass('selectBox-disabled')) return false;
					if (li.length === 0 || li.hasClass('selectBox-disabled')) return false;
					if (select.data('multiple')) {
						// If event.shiftKey is true, this will select all options between li and the last li selected
						if (event.shiftKey && control.data('selectBox-last-selected')) {
							li.toggleClass('selectBox-selected');
							var affectedOptions;
							if (li.index() > control.data('selectBox-last-selected').index()) {
								affectedOptions = li.siblings().slice(control.data('selectBox-last-selected').index(), li.index());
							} else {
								affectedOptions = li.siblings().slice(li.index(), control.data('selectBox-last-selected').index());
							}
							affectedOptions = affectedOptions.not('.selectBox-optgroup, .selectBox-disabled');
							if (li.hasClass('selectBox-selected')) {
								affectedOptions.addClass('selectBox-selected');
							} else {
								affectedOptions.removeClass('selectBox-selected');
							}
						} else if ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) {
							li.toggleClass('selectBox-selected');
						} else {
							li.siblings().removeClass('selectBox-selected');
							li.addClass('selectBox-selected');
						}
					} else {
						li.siblings().removeClass('selectBox-selected');
						li.addClass('selectBox-selected');
					}
					// wtf.
					/*
					if (control.hasClass('selectBox-dropdown')) {
						control.find('.selectBox-label').text(li.text());
					}
					*/
					
					// Update original control's value
					var i = 0,
						selection = [];
					if (select.data('multiple')) {
						control.find('.selectBox-selected a').each(function() {
							selection[i++] = $(this).attr('rel');
						});
					} else {
						
						var tmp = function () {
							if(select[0].nodeName.toLowerCase()=='select') {
								return select.find('option')
							} else {
								return select.find('li')
							}	
						},
						original = li.data('original'),
						selectOptions = tmp();
						selection = li.find('a').attr('rel');
						
						selectOptions.each(function(v, e) {
							$(e)
								.attr('data-selected', 'false')
								.data('selected', 'false');
						});
						original
							.attr('data-selected', 'true')
							.data('selected', 'true');
					}
					// Remember most recently selected item
					control.data('selectBox-last-selected', li);
					
					if (select.data('value') !== selection) {
						select.data('value', selection);
						setLabel(select);
						select.trigger('change');
					}
					return true;
				};
			var addHover = function(select, li) {
					select = $(select);
					li = $(li);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options');
					options.find('.selectBox-hover').removeClass('selectBox-hover');
					li.addClass('selectBox-hover');
				};
			var removeHover = function(select, li) {
					select = $(select);
					li = $(li);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options');
					options.find('.selectBox-hover').removeClass('selectBox-hover');
				};
			var keepOptionInView = function(select, li, center) {
					if (!li || li.length === 0) return;
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options'),
						scrollBox = control.hasClass('selectBox-dropdown') ? options : options.parent(),
						top = parseInt(li.offset().top - scrollBox.position().top),
						bottom = parseInt(top + li.outerHeight());
					if (center) {
						scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop() - (scrollBox.height() / 2));
					} else {
						if (top < 0) {
							scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop());
						}
						if (bottom > scrollBox.height()) {
							scrollBox.scrollTop((li.offset().top + li.outerHeight()) - scrollBox.offset().top + scrollBox.scrollTop() - scrollBox.height());
						}
					}
				};
				
			
			var handleKeyDown = function(select, event) {
					//
					// Handles open/close and arrow key functionality
					//
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options'),
						settings = select.data('selectBox-settings'),
						totalOptions = 0,
						i = 0,
						keyDownHelper = function (flag) {
							event.preventDefault();
							if (control.hasClass('selectBox-menuShowing')) {
								var obj = (flag == 'prev' ? options.find('.selectBox-hover').prev('li') : options.find('.selectBox-hover').next('li'))
								totalOptions = options.find('li:not(.selectBox-optgroup)').length;
								i = 0;
								while (obj.length === 0 || obj.hasClass('selectBox-disabled') || obj.hasClass('selectBox-optgroup')) {
									obj = (flag == 'prev' ? obj.prev('li') : obj.next('li'));
									if (obj.length === 0) {
										if (settings.loopOptions) {
											obj = options.find('li:last');
										} else {
											obj = options.find('li:first');
										}
									}
									if (++i >= totalOptions) break;
								}
								addHover(select, obj);
								selectOption(select, obj, event);
								keepOptionInView(select, obj);
							} else {
								showMenu(select);
							}
					
						};
						
					if (control.hasClass('selectBox-disabled')) return;
					switch (event.keyCode) {
					case 8:
						// backspace
						event.preventDefault();
						typeSearch = '';
						break;
					case 9:
						// tab
					case 27:
						// esc
						hideMenus();
						removeHover(select);
						break;
					case 13:
						// enter
						if (control.hasClass('selectBox-menuShowing')) {
							selectOption(select, options.find('li.selectBox-hover:first'), event);
							if (control.hasClass('selectBox-dropdown')) hideMenus();
						} else {
							showMenu(select);
						}
						break;
					case 38:
						// up
					case 37:
						// left
						keyDownHelper('prev');
						break;
					case 40:
						// down
					case 39:
						// right
						keyDownHelper('next');
						break;
					}
				};
				
			var handleKeyPress = function(select, event) {
					//
					// Handles type-to-find functionality
					//
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options');
					if (control.hasClass('selectBox-disabled')) return;
					
					// Type to find
					if (!control.hasClass('selectBox-menuShowing')) showMenu(select);
					event.preventDefault();
					clearTimeout(typeTimer);
					typeSearch += String.fromCharCode(event.charCode || event.keyCode);
					options.find('A').each(function() {
						if ($(this).text().substr(0, typeSearch.length).toLowerCase() === typeSearch.toLowerCase()) {
							addHover(select, $(this).parent());
							keepOptionInView(select, $(this).parent());
							return false;
						}
					});
					// Clear after a brief pause
					typeTimer = setTimeout(function() {
						typeSearch = '';
					}, 1000);
				};
			var enable = function(select) {
					select = $(select);
					select.data('disabled', false);
					var control = select.data('selectBox-control');
					if (!control) return;
					control.removeClass('selectBox-disabled');
				};
			var disable = function(select) {
					select = $(select);
					select.data('disabled', true);
					var control = select.data('selectBox-control');
					if (!control) return;
					control.addClass('selectBox-disabled');
				};
			// Only called manually	
			var setValue = function(select, value) { 
					select = $(select);
					
					if(select.data('disabled')) {
						select.data('value', null);
						return;
					}
					
					select.data('value', value);
					value = select.data('value'); // IE9's select would be null if it was set with a non-exist options value
					
					var control = select.data('selectBox-control');
					if (!control) return;
					var settings = select.data('selectBox-settings'),
						options = control.data('selectBox-options');
					// Update label
					setLabel(select);
					// Update control values
					options.find('.selectBox-selected').removeClass('selectBox-selected');
					options.find('a').each(function() {
						if (typeof(value) === 'object' && select.data('multiple')) {
							for (var i = 0; i < value.length; i++) {
								if ($(this).attr('rel') == value[i]) {
									$(this).parent().addClass('selectBox-selected');
								}
							}
						} else {
							if ($(this).attr('rel') == value) {
								selectOption(select, $(this).parent(), {})
							}
						}
					});
					if (settings.change) settings.change.call(select);
				};
			var setReset = function(select, value) { 
					select = $(select);
					select.data('value', null);
					
					var control = select.data('selectBox-control');
					if (!control) return;
					var options = control.data('selectBox-options');
					
					// Update control 
					options.find('.selectBox-selected').removeClass('selectBox-selected');
					// Update select 
					select
						.find('li[data-selected="true"]')
						.attr('data-selected', 'false')
						.data('selected', 'false');
					// Update label
					setLabel(select);
					return;
				};	
			var disableSelection = function(selector) {
					$(selector).css('MozUserSelect', 'none').on('selectstart', function(event) {
						event.preventDefault();
					});
				};
			var generateOptions = function(self, options) {
				var 
					a = $('<a />')
						.attr('rel', self.data('value') || self.val())
						.text(self.text()),
					li = $('<li />')
						.addClass(self.attr('class'))
						.data(self.data())
						.data('original', self)
						.append(a);
						
				self.data('clone', li);
				if (self.data('disabled')) {
					li.addClass('selectBox-disabled');
				}
				// if (self.data('selected')) li.addClass('selectBox-selected');
				options.append(li);
			};
			// some cleanup helpers
			var helperSelectBoxActive = function(control) {
				return control.hasClass('selectBox-active');
			}
				
			//
			// Public methods
			//
			switch (method) {
			case 'control':
				return $(this).data('selectBox-control');
			case 'settings':
				if (!data) return $(this).data('selectBox-settings');
				$(this).each(function() {
					$(this).data('selectBox-settings', $.extend(true, $(this).data('selectBox-settings'), data));
				});
				break;
			case 'options':
				// Getter
				if (data === undefined) return $(this).data('selectBox-control').data('selectBox-options');
				// Setter
				$(this).each(function() {
					//setOptions(this, data);
				});
				break;
			case 'value':
				if (data === undefined)  {
					return $(this).data('value');
				} else {
					$(this).each(function() {
						setValue(this, data);
					});
				}	
				break;	
			case 'reset':
				$(this).each(function() {
					setReset(this);
				});
				break;	
			case 'refresh':
				$(this).each(function() {
					refresh(this);
				});
				break;
			case 'enable':
				$(this).each(function() {
					enable(this);
				});
				break;
			case 'disable':
				$(this).each(function() {
					disable(this);
				});
				break;
			case 'destroy':
				$(this).each(function() {
					destroy(this);
				});
				break;
			default:
				$(this).each(function() {
					init(this, method);
				});
				break;
			}
			return $(this);
		}
	});
})(jQuery);