/* Copyright (c) 2012 HyeonJe Jun (http://github.com/noraesae)
 * Licensed under the MIT License
 */
((($ => {

  // The default settings for the plugin
  var defaultSettings = {
    wheelSpeed: 10,
    wheelPropagation: false
  };

  $.fn.perfectScrollbar = function (suppliedSettings, option) {

    return this.each(function () {
      // Use the default settings
      var settings = $.extend(true, {}, defaultSettings);
      if (typeof suppliedSettings === "object") {
        // But over-ride any supplied
        $.extend(true, settings, suppliedSettings);
      } else {
        // If no settings were supplied, then the first param must be the option
        option = suppliedSettings;
      }

      if (option === 'update') {
        if ($(this).data('perfect-scrollbar-update')) {
          $(this).data('perfect-scrollbar-update')();
        }
        return $(this);
      }
      else if (option === 'destroy') {
        if ($(this).data('perfect-scrollbar-destroy')) {
          $(this).data('perfect-scrollbar-destroy')();
        }
        return $(this);
      }

      if ($(this).data('perfect-scrollbar')) {
        // if there's already perfect-scrollbar
        return $(this).data('perfect-scrollbar');
      }

      var $this = $(this).addClass('ps-container');
      var $scrollbarX = $("<div class='ps-scrollbar-x'></div>").appendTo($this);
      var $scrollbarY = $("<div class='ps-scrollbar-y'></div>").appendTo($this);
      var containerWidth;
      var containerHeight;
      var contentWidth;
      var contentHeight;
      var scrollbarXWidth;
      var scrollbarXLeft;
      var scrollbarXBottom = parseInt($scrollbarX.css('bottom'), 10);
      var scrollbarYHeight;
      var scrollbarYTop;
      var scrollbarYRight = parseInt($scrollbarY.css('right'), 10);

      var updateContentScrollTop = () => {
        var scrollTop = parseInt(scrollbarYTop * contentHeight / containerHeight, 10);
        $this.scrollTop(scrollTop);
        $scrollbarX.css({bottom: scrollbarXBottom - scrollTop});
      };

      var updateContentScrollLeft = () => {
        var scrollLeft = parseInt(scrollbarXLeft * contentWidth / containerWidth, 10);
        $this.scrollLeft(scrollLeft);
        $scrollbarY.css({right: scrollbarYRight - scrollLeft});
      };

      var updateScrollbarCss = () => {
        $scrollbarX.css({left: scrollbarXLeft + $this.scrollLeft(), bottom: scrollbarXBottom - $this.scrollTop(), width: scrollbarXWidth});
        $scrollbarY.css({top: scrollbarYTop + $this.scrollTop(), right: scrollbarYRight - $this.scrollLeft(), height: scrollbarYHeight});
      };

      var updateBarSizeAndPosition = () => {
        containerWidth = $this.width();
        containerHeight = $this.height();
        contentWidth = $this.prop('scrollWidth');
        contentHeight = $this.prop('scrollHeight');
        if (containerWidth < contentWidth) {
          scrollbarXWidth = parseInt(containerWidth * containerWidth / contentWidth, 10);
          scrollbarXLeft = parseInt($this.scrollLeft() * containerWidth / contentWidth, 10);
        }
        else {
          scrollbarXWidth = 0;
          scrollbarXLeft = 0;
          $this.scrollLeft(0);
        }
        if (containerHeight < contentHeight) {
          scrollbarYHeight = parseInt(containerHeight * containerHeight / contentHeight, 10);
          scrollbarYTop = parseInt($this.scrollTop() * containerHeight / contentHeight, 10);
        }
        else {
          scrollbarYHeight = 0;
          scrollbarYTop = 0;
          $this.scrollTop(0);
        }

        if (scrollbarYTop >= containerHeight - scrollbarYHeight) {
          scrollbarYTop = containerHeight - scrollbarYHeight;
        }
        if (scrollbarXLeft >= containerWidth - scrollbarXWidth) {
          scrollbarXLeft = containerWidth - scrollbarXWidth;
        }

        updateScrollbarCss();
      };

      var moveBarX = (currentLeft, deltaX) => {
        var newLeft = currentLeft + deltaX;
        var maxLeft = containerWidth - scrollbarXWidth;

        if (newLeft < 0) {
          scrollbarXLeft = 0;
        }
        else if (newLeft > maxLeft) {
          scrollbarXLeft = maxLeft;
        }
        else {
          scrollbarXLeft = newLeft;
        }
        $scrollbarX.css({left: scrollbarXLeft + $this.scrollLeft()});
      };

      var moveBarY = (currentTop, deltaY) => {
        var newTop = currentTop + deltaY;
        var maxTop = containerHeight - scrollbarYHeight;

        if (newTop < 0) {
          scrollbarYTop = 0;
        }
        else if (newTop > maxTop) {
          scrollbarYTop = maxTop;
        }
        else {
          scrollbarYTop = newTop;
        }
        $scrollbarY.css({top: scrollbarYTop + $this.scrollTop()});
      };

      var bindMouseScrollXHandler = () => {
        var currentLeft;
        var currentPageX;

        $scrollbarX.bind('mousedown.perfect-scroll', e => {
          currentPageX = e.pageX;
          currentLeft = $scrollbarX.position().left;
          $scrollbarX.addClass('in-scrolling');
          e.stopPropagation();
          e.preventDefault();
        });

        $(document).bind('mousemove.perfect-scroll', e => {
          if ($scrollbarX.hasClass('in-scrolling')) {
            updateContentScrollLeft();
            moveBarX(currentLeft, e.pageX - currentPageX);
            e.stopPropagation();
            e.preventDefault();
          }
        });

        $(document).bind('mouseup.perfect-scroll', e => {
          if ($scrollbarX.hasClass('in-scrolling')) {
            $scrollbarX.removeClass('in-scrolling');
          }
        });
      };

      var bindMouseScrollYHandler = () => {
        var currentTop;
        var currentPageY;

        $scrollbarY.bind('mousedown.perfect-scroll', e => {
          currentPageY = e.pageY;
          currentTop = $scrollbarY.position().top;
          $scrollbarY.addClass('in-scrolling');
          e.stopPropagation();
          e.preventDefault();
        });

        $(document).bind('mousemove.perfect-scroll', e => {
          if ($scrollbarY.hasClass('in-scrolling')) {
            updateContentScrollTop();
            moveBarY(currentTop, e.pageY - currentPageY);
            e.stopPropagation();
            e.preventDefault();
          }
        });

        $(document).bind('mouseup.perfect-scroll', e => {
          if ($scrollbarY.hasClass('in-scrolling')) {
            $scrollbarY.removeClass('in-scrolling');
          }
        });
      };

      // bind handlers
      var bindMouseWheelHandler = () => {
        var shouldPreventDefault = (deltaX, deltaY) => {
          var scrollTop = $this.scrollTop();
          if (scrollTop === 0 && deltaY > 0 && deltaX === 0) {
            return !settings.wheelPropagation;
          }
          else if (scrollTop >= contentHeight - containerHeight && deltaY < 0 && deltaX === 0) {
            return !settings.wheelPropagation;
          }

          var scrollLeft = $this.scrollLeft();
          if (scrollLeft === 0 && deltaX < 0 && deltaY === 0) {
            return !settings.wheelPropagation;
          }
          else if (scrollLeft >= contentWidth - containerWidth && deltaX > 0 && deltaY === 0) {
            return !settings.wheelPropagation;
          }
          return true;
        };

        $this.bind('mousewheel.perfect-scroll', (e, delta, deltaX, deltaY) => {
          $this.scrollTop($this.scrollTop() - (deltaY * settings.wheelSpeed));
          $this.scrollLeft($this.scrollLeft() + (deltaX * settings.wheelSpeed));

          // update bar position
          updateBarSizeAndPosition();

          if (shouldPreventDefault(deltaX, deltaY)) {
            e.preventDefault();
          }
        });
      };

      // bind mobile touch handler
      var bindMobileTouchHandler = () => {
          //alert("bind");
        var applyTouchMove = (differenceX, differenceY) => {
            alert ("apply")
          $this.scrollTop($this.scrollTop() - differenceY);
          $this.scrollLeft($this.scrollLeft() - differenceX);

          // update bar position
          updateBarSizeAndPosition();
        };
      };

      var destroy = () => {
        $scrollbarX.remove();
        $scrollbarY.remove();
        $this.unbind('.perfect-scroll');
        $(window).unbind('.perfect-scroll');
        $this.data('perfect-scrollbar', null);
        $this.data('perfect-scrollbar-update', null);
        $this.data('perfect-scrollbar-destroy', null);
      };

      var ieSupport = version => {
        $this.addClass('ie').addClass('ie' + version);

        var bindHoverHandlers = () => {
          var mouseenter = function () {
            $(this).addClass('hover');
          };
          var mouseleave = function () {
            $(this).removeClass('hover');
          };
          $this.bind('mouseenter.perfect-scroll', mouseenter).bind('mouseleave.perfect-scroll', mouseleave);
          $scrollbarX.bind('mouseenter.perfect-scroll', mouseenter).bind('mouseleave.perfect-scroll', mouseleave);
          $scrollbarY.bind('mouseenter.perfect-scroll', mouseenter).bind('mouseleave.perfect-scroll', mouseleave);
        };

        var fixIe6ScrollbarPosition = () => {
          updateScrollbarCss = () => {
            $scrollbarX.css({left: scrollbarXLeft + $this.scrollLeft(), bottom: scrollbarXBottom, width: scrollbarXWidth});
            $scrollbarY.css({top: scrollbarYTop + $this.scrollTop(), right: scrollbarYRight, height: scrollbarYHeight});
            $scrollbarX.hide().show();
            $scrollbarY.hide().show();
          };
          updateContentScrollTop = () => {
            var scrollTop = parseInt(scrollbarYTop * contentHeight / containerHeight, 10);
            $this.scrollTop(scrollTop);
            $scrollbarX.css({bottom: scrollbarXBottom});
            $scrollbarX.hide().show();
          };
          updateContentScrollLeft = () => {
            var scrollLeft = parseInt(scrollbarXLeft * contentWidth / containerWidth, 10);
            $this.scrollLeft(scrollLeft);
            $scrollbarY.hide().show();
          };
        };

        if (version === 6) {
          bindHoverHandlers();
          fixIe6ScrollbarPosition();
        }
      };

      var supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
      if(navigator.userAgent.match(/Touch/)) {
          // hack for windows surface
          supportsTouch = true;
      }

      var initialize = () => {
        var ieMatch = navigator.userAgent.toLowerCase().match(/(msie) ([\w.]+)/);
        if (ieMatch && ieMatch[1] === 'msie') {
          // must be executed at first, because 'ieSupport' may addClass to the container
          ieSupport(parseInt(ieMatch[2], 10));
        }

        updateBarSizeAndPosition();
        bindMouseScrollXHandler();
        bindMouseScrollYHandler();
        if (supportsTouch) {
          bindMobileTouchHandler();
        }
        if ($this.mousewheel) {
          bindMouseWheelHandler();
        }
        $this.data('perfect-scrollbar', $this);
        $this.data('perfect-scrollbar-update', updateBarSizeAndPosition);
        $this.data('perfect-scrollbar-destroy', destroy);
      };

      // initialize
      initialize();

      return $this;
    });
  };
}))(jQuery));
