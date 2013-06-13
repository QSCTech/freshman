var Doc = function(md) {

    var that = this,
        html = markdown.toHTML(md);
    // 匹配子题标
    html = html.replace(/<h2>(.*)——(.*) (.*)<\/h2>/g, "<h2>$1</h2><div class=\"sub-header\">$2<br>$3</div>");
    // 匹配折叠
    html = html.replace(/<p>@@[ ]*([^<]+)<\/p>/g, '<div class="hide-elem"><div class="hide-elem-title">$1</div><div class="hide-elem-content">');
    html = html.replace(/<p>@@<\/p>/g, '</div></div>');
    html = html.replace(/\\n/g, '<br>'); // 匹配 \n 为 <br>
    html = html.replace(/<p>[ ]+/, '<p>'); // 去除 <p> 标签开头的空白
    html = html.replace(/<p>(<img alt="cover".*>)<\/p>/g, '$1');
    var jq = $(html);

    this.nav = function() {
        var jq = $(html).filter('h1, h2');
        $('nav').html(jq);
    };

    this.section = function(title) {
        title = title.replace(/ /g, '');
        var jq = $(html);
        // 导航栏动画
        $('nav h1').each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                $('nav h1.current').removeClass('current');
                $(this).addClass('current');
                $('h2.current').removeClass('current');
                window.animateLock = true;
                $('nav h2').stop(); // 终止动画
                $('nav h2').each(function() {
                    $(this).slideUp(400, function() {
                        window.animateLock = false;
                    });
                });
                var iter = function(jqObj) {
                    var $next = jqObj.next();
                    if($next[0] && $next[0].nodeName.toLowerCase() != 'h1' && $next.parent()[0].nodeName.toLowerCase() == 'nav') {
                        $next.slideDown({
                            duration: 400,
                            easing: "linear",
                            complete: function() {
                                if(!window.animateLock) {
                                    iter($next);
                                }
                            }
                        });
                    }
                }
                iter($(this));
            }
        });
        jq.each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var nextSection = $(this).nextAll('h1');
                nextSection = nextSection.first().text();
                if(nextSection) {
                    nextSection = $('<div id="next-chapter"><span>阅读下一章节</span><br></div>').append(nextSection);
                    nextSection = $('<section class="next"></section>').append(nextSection);
                }
                $('article').html('');
                var subSections = $(this).nextUntil("h1");
                subSections = subSections.each(function() {
                    var nodeName = $(this)[0].nodeName.toLowerCase();
                    if(nodeName == 'h2') {
                        var subSection = $(this).nextUntil("h1,h2"),
                            jq;
                        if($(this).find('em').text()) {
                            jq = $('<section class="em"><h2>'+$(this).text()+'</h2></section>');
                        } else {
                            jq = $('<section><h2>'+$(this).text()+'</h2></section>');
                        }
                        var findBaidu = false;
                        if($(this).text() == '周边观察版') {
                            jq.attr('id', 'baidu-map');
                            findBaidu = true;
                        }
                        jq = jq.append(subSection);
                        $('article').append(jq);
                        if(findBaidu) {
                            doc.baiduMap();
                        }
                    }
                });
                if(nextSection) {
                    $('article').append(nextSection);
                }
                return false; // break
            };
        });
        loadPerfectScrollBar();
        var subSection = $('article section').first().find('h2').first().text();
        that.subSection(subSection);
    };

    var loadPerfectScrollBar = function() {
        var loadPerfectScrollBar = function(that) {
            var offset = $(that)[0].scrollHeight - $(that).height();
            if(offset <= 40) return;
            if($(that).hasClass('perfect-scrollbar')) return;
            $(that).addClass('perfect-scrollbar');
            $(that).perfectScrollbar({
                wheelSpeed: 40,
                wheelPropagation: true
            });
        };
        // 保证点击折叠类的东西点击后能正常加载滚动条
        $('article section').click(function() {
            var callback = (function(that) {
                return function () {
                    loadPerfectScrollBar(that);
                }
            })(this);
            setTimeout(callback, 400);
            loadPerfectScrollBar(this);
        });
        $('article section').hover(
          function() {
              loadPerfectScrollBar(this);
          },
          function() {
              $(this).removeClass('perfect-scrollbar');
              $(this).perfectScrollbar('destroy');
          }
        );
    };

    this.subSection = function(title) {
        title = title.replace(/ /g, '');
        $('nav h2').each(function() {
            if(title == $(this).text().replace(/ /g, '')) {
                $('nav h2.current').removeClass('current');
                $(this).addClass('current');
            }
        });
        var offsetLeft = 0;
        $('article section').each(function() {
            if(title == $(this).find('h2').first().text().replace(/ /g, '')) {
                $('article section.current').removeClass('current');
                $(this).addClass('current');
                $('article').animate({'margin-left': -offsetLeft}, 400);
                return false;
            }
            offsetLeft += $(this).outerWidth(true); // Sum of width, padding, borders, margins
        });
    };

    this.highlight = function(text, timeout) {
        if(!timeout) timeout = 50;
        setTimeout(function() {
            $('article').removeHighlight();
            $('article').highlight(text);
        }, timeout);
    };

    this.search = function(text) {
        $('article').html('');
        $('nav .current').removeClass('current');
        $('nav h2').slideUp();
        var jq = $(html).each(function() {
            var nodeName = $(this)[0].nodeName.toLowerCase();
            if(nodeName == 'h2') {
                var subSection = $(this).nextUntil("h1,h2"),
                    jq;
                if($(this).find('em').text()) {
                    jq = $('<section class="em"><h2>'+$(this).text()+'</h2></section>');
                } else {
                    jq = $('<section><h2>'+$(this).text()+'</h2></section>');
                }
                jq = jq.append(subSection);
                if($(this).text().toUpperCase().indexOf(text.toUpperCase()) > -1 || jq.text().toUpperCase().indexOf(text.toUpperCase()) > -1) {
                    $('article').append(jq);
                }
            }
        });
        $('article section').first().addClass('current');
        loadPerfectScrollBar();
        that.highlight(text);
    };

    this.baiduMap = function() {
        if(typeof resizeHook != "undefined")
          resizeHook();
        var map = new BMap.Map("baidu-map");
        map.centerAndZoom(new BMap.Point(120.09391065692903, 30.310239963664857), 16);
        map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
        $('#baidu-map').append('<h2>周边观察版</h2>');
    };

};


var Cover = function() {
    var selector = 'article img[alt="cover"]',
        that = this;

    this.start = function() {
        that.stop(); // make sure only one interval exists
        that.init();
        //        $('body').css({'overflow-y': 'hidden'});
        window.coverInterval = setInterval(function() {
            that.next();
        }, 3000);
        window.coverTestInterval = setInterval(function() {
            that.test();
        }, 500);
    };

    // auto stop if img disappears
    this.test = function() {
        if($(selector).length == 0) {
            that.stop();
        }
    };

    this.stop = function() {
        //        $('body').css({'overflow-y': 'auto'});
        clearInterval(window.coverInterval);
        clearInterval(window.coverTestInterval);
    };

    this.init = function() {
        $('body, html').animate({scrollTop: 0});
        $(selector).fadeOut(200, function() {
            $(selector).first().fadeIn();
        });
    };

    this.next = function() {
        $(selector).each(function() {
            if($(this).is(':visible')) {
                $(this).fadeOut(200, function() {
                    var next = $(this).nextAll(selector);
                    if(next.length == 0) {
                        that.init();
                        return false;
                    }
                    next = next.first();
                    next.fadeIn();
                });
            }
        });
    };
};

$(document).ready(function() {
    $.get('markdown/freshman.md', function(data) {
        doc = new Doc(data);
        doc.nav();
        doc.section("地图");
        $('body').animate({opacity: 1}, 1000);
    });

    $('article').on('click', 'section', function(event) {
        if($(this).hasClass('next')) {
            var title = $('nav h1.current').nextAll('h1').first().text();
            if(title) {
                doc.section(title);
            }
        } else {
            var title = $(this).find('h2').first().text();
            if(title) {
                doc.subSection(title);
            }
        }
    });

    $('body').on('click', 'h1', function() {
        var title = $(this).text();
        title = title.replace(/<i>.*<\/i>/, '');
        doc.section(title);
        setTimeout(function() {
            cover.start();
        }, 500);
    });

    $('body').on('click', 'h2', function() {
        if($('#index').attr('id') == 'index') {
            var pos = $(this).prevAll('h1').first().text().replace(/ /g, '');
            var cur = $('nav h1').text().replace(/<i>.*<\/i>/, '').replace(/ /g, '');
            if(cur != pos) {
                doc.section(pos);
            }
        }
        var title = $(this).text();
        doc.subSection(title, true);
        setTimeout(function() {
            $('body, html').animate({scrollTop: 0});
        }, 600);
    });

    $('#search').on('keyup', function() {
        var text = $(this).val();
        doc.search(text);
    });

    $('article').on('click', '.hide-elem-title', function() {
        $(this).parent().find('.hide-elem-content').each(function() {
            if($(this).is(":visible")) {
                $(this).slideUp(400);
            } else {
                $(this).slideDown(400);
            }
        });
    });

    // 绑定方向键
    $('body').keyup(function(e) {
        var code = e.keyCode;
        if(code == 39 || code == 40) {
            $('#next').click();
        }
        if(code == 37 || code == 38) {
            $('#prev').click();
        }
    });

    // force no scroll
    $(window).scroll(function() {
        window.scrollTo(0, 0);
    });

    $('#next').click(function() {
        var next = $('section.current').first().next().find('h2').first().text();
        if(next) {
            doc.subSection(next);
        } else {
            next = $('nav h1.current').first().nextAll('h1').first().text();
            if(next) {
                doc.section(next);
            }
        }
    });

    $('#prev').click(function() {
        var prev = $('section.current').first().prev().find('h2').first().text();
        if(prev) {
            doc.subSection(prev);
        } else {
            prev = $('nav h1.current').first().prevAll('h1').first().text();
            if(prev) {
                doc.section(prev);
            }
        }
    });

});

var resizeHook = function() {
    var w = $(window).width();
    var h = $(window).height();
    $('article').css({height: h});
    $('#allmap').css({width: w - 150});

    var scale = (w - 150) / h,
        imgScale = 16 / 9;
    if(imgScale > scale) {
        $('img[alt="cover"]').css({width: 'auto', height: h});
    } else {
        $('img[alt="cover"]').css({width: w - 150, height: 'auto'});
    }

};
$(document).ready(function() {
    resizeHook();
});
if (window.addEventListener) {
    window.addEventListener('resize', function() { resizeHook(); });
} else if (window.attachEvent) {
    // for ie
    window.attachEvent('resize', function() { resizeHook(); });
}
