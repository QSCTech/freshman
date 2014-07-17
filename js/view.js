var aboutQSC = function() {
    $('#cover').fadeOut(800);
    doc.section('特典', function() {
        doc.subSection('求是潮');
    });
}

var fallback = function() {
    var ua = navigator.userAgent;
    if(ua.match(/Phone|Mob|Android|Touch/))
       window.location.href = './mobile/';
}
fallback();

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

    var coverNav = $(html).filter('h1');
    $('#cover-nav').append(coverNav);

    this.applyPictureInfo = function(obj) {
        this.picture_info = obj;
        // cover0 先行
        this.displayPictureInfo('cover0');
    };

    this.displayPictureInfo = function(name) {
        $('#picture-info').unbind('click').bind('click', function() {
            $(this).fadeOut();
        });
        $(this).fadeIn();
        try {
            if (typeof(this.picture_info[name]) == 'undefined') {
                name = /\/?([^/.]+)\.jpg$/.exec(name)[1];
            }
            $('#picture-info-author').html(this.picture_info[name].author);
            $('#picture-info-info').html(this.picture_info[name].info);
        } catch(e) {
            $('#picture-info-author').html('');
            $('#picture-info-info').html('');
        }
    };

    this.nav = function() {
        var jq = $(html).filter('h1, h2');
        $('nav').html(jq);
        $('nav').prepend('<div id="zju-logo"></div><div id="sidebar">新生手册</div><div id="nav-top">浙江大学<br><strong>新生手册</strong></div><hr>');
    };

    this.comment = function() {
        window.uyan_config = {
            title:'求是潮新生手册',
            su:'qsc-freshman',
            url:'http://f.myqsc.com/'
        };
        $('article section#comments').append('<div id="uyan_frame"></div><script type="text/javascript" id="UYScript" src="http://v1.uyan.cc/js/iframe.js?UYUserId=1811609" async=""></script>');
    };

    this.section = function(title, callback) {
        if(debug) alert(title);
        $('article').animate({opacity: 0}, 200, 'linear', function() {
            var getSectionNth = function(callback) {
                var nth = 0;
                $('nav h1').each(function() {
                    var text = $(this).text().replace(/ /g, '');
                    if(text == title) {
                        callback(nth);
                        return false;
                    }
                    ++nth;
                });
            }
            var applyThemeColor = function() {
                var colors = ['ffb300', '46775f', '00b551', '00cfb0', '00bce6', '556066', '556066'];
                getSectionNth(function(nth) {
                    if (nth >= colors.length) {
                        nth -= colors.length;
                    }
                    var color = colors[nth];
                    window.themeColor = color; // 留待后用
                    less.modifyVars({
                        '@theme': '#'+color
                    });
                    var css = '[class^="icon-"]:before,'
                              + '[class*=" icon-"]:before {'
                              + 'text-decoration: inherit;'
                              + 'display: inline-block;'
                              + 'speak: none;'
                              + '}'
                            + '.icon-angle-left:before           { content: "\f104"; }'
                            + '.icon-angle-right:before          { content: "\f105"; }'
                            + '.icon-angle-up:before             { content: "\f106"; }'
                            + '.icon-angle-down:before           { content: "\f107"; }';

                    $('head').append('<style>'+css+'</style>');

                });
            }
            applyThemeColor();

            jq.each(function() {
                if($(this).text().replace(/ /g, '') == title) {
                    var nextSection = $(this).nextAll('h1');
                    nextSection = nextSection.first().text();
                    if(nextSection) {
                        nextSection = $('<div id="next-chapter"><span>阅读下一章节</span><br></div>').append(nextSection);
                        nextSection = $('<section class="next"></section>').append(nextSection);
                    }

                    $('article').html('<section class="cover"></div>');
                    var preface = $(this).nextUntil('h2');
                    var imgs = preface.filter('img');
                    var p = preface.filter('p');
                    $('section.cover').append(imgs);
                    $('section.cover').append('<div class="mask"></div><div id="section-preface"></div>');
                    $('#section-preface').append('<h2>'+title+'篇</h2>');
                    $('#section-preface').append(p);

                    var subSections = $(this).nextUntil("h1");
                    subSections = subSections.each(function() {
                        var nodeName = $(this).prop('nodeName').toLowerCase();
                        if(nodeName == 'h2') {
                            var subSection = $(this).nextUntil("h1,h2"),
                                jq;
                            if($(this).find('em').text()) {
                                jq = $('<section class="em"><h2>'+$(this).text()+'</h2></section>');
                            } else {
                                jq = $('<section class="sub"><h2>'+$(this).text()+'</h2></section>');
                            }
                            var find = {};
                            jq = jq.append(subSection);
                            $('article').append(jq);
                        }
                    });
                    if(nextSection) {
                        $('article').append(nextSection);
                    }
                    return false; // break
                };
            });
            var subSection = $('article section').first().find('h2').first().text();
            that.subSection(subSection);
            that.sectionReady(title);
            if(typeof callback == "function")
              callback(title);
            $('article').animate({opacity: 1}, 400);
        });
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
                    $(this).slideUp({
                        duration: 400,
                        easing: 'linear',
                        complete: function() {
                            window.animateLock = false;
                        }
                    });
                });
                var iter = function(jqObj) {
                    var $next = jqObj.next();
                    if($next[0] && $next[0].nodeName.toLowerCase() != 'h1' && $next.parent()[0].nodeName.toLowerCase() == 'nav') {
                        $next.slideDown({
                            duration: 200,
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
    };

    this.applyScrollBar = function(that) {
        var offset = $(that)[0].scrollHeight - $(that).height();
        if(offset <= 40) return;
        if($(that).hasClass('perfect-scrollbar')) return;
        $(that).addClass('perfect-scrollbar');
        $(that).perfectScrollbar({
            wheelSpeed: 40,
            wheelPropagation: false
        });
    }
    var loadPerfectScrollBar = function() {
        var loadPerfectScrollBar = function(dom) {
            that.applyScrollBar(dom);
        };
        var isInScrolling = function () {
            return $('article section .ps-scrollbar-y.in-scrolling').length > 0;
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
              if (!isInScrolling()) {
                  loadPerfectScrollBar(this);
              }
          },
          function() {
              if (!isInScrolling()) {
                  $(this).removeClass('perfect-scrollbar');
                  $(this).perfectScrollbar('destroy');
              }
          }
        );
    };

    this.sectionReady = function(arg) {
        if(typeof arg == "function") {
            window.sectionOnloadHook = window.sectionOnloadHook ? window.sectionOnloadHook.push(arg) : [arg];
        } else {
            // when called without a function argument, call all the callbacks
            var callbacks = window.sectionOnloadHook;
            if(callbacks) {
                for(var i = 0; i<callbacks.length; i++) {
                    var fun = callbacks[i];
                    fun(arg);
                }
            }
        }
    };

    this.testPrevAndNext = function() {
        // 判断是否应该显示#prev, #next, #section-pracface，并操作之
        if($('section.current').prevAll('section').first().html()) {
            $('#prev').show();
        } else {
            $('#prev').hide();
        }
        if($('section.current').nextAll('section').first().html() || $('nav h1.current').nextAll('h1').first().html()) {
            $('#next').show();
        } else {
            $('#next').hide();
        }
        $('#prev').is(':visible') ? $('#section-preface').hide() : $('#section-preface').show();
        $('#next').is(':visible') ? $('#prev').css({right: 80}) : $('#prev').css({right: 0});
        // 计算 #search的位置
        var count = 0;
        if ($('#prev').is(':visible')) {
            count++;
        }
        if ($('#next').is(':visible')) {
            count++;
        }
        var offset = count * 80;
        $('#search').css('right', offset);
    }

    this.sectionReady(function(title) {
        that.img();
        setSectionPreface();
        that.testPrevAndNext();
        that.updateUrl('#!/'+title);
        if(title == '讨论') {
            $('article').html('<section id="comments"></section>');
            if(window.commentLoaded)
              window.location.reload(); // 强制刷新以重载uyan
            window.commentLoaded = true;
            that.comment();
        }
        if(title == '搜索') {
            $('article').html('<input type="text" id="search" placeholder="戳我以搜索">');
            doc.search('');
            $('#search').on('keyup', function() {
                doc.search($(this).val());
            });
        }
        window.currentSection = title;
        loadPerfectScrollBar();
    });

    this.subSection = function(title) {
        title = title.replace(/ /g, '');
        var isSectionPreface = false;
        $('nav h1').each(function() {
            if(title.replace(/篇/g, '') == $(this).text().replace(/ /g, '')) {
                isSectionPreface = true;
            }
        });
        if(!isSectionPreface)
          that.updateUrl('#!/'+window.currentSection+'/'+title);
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
                that.testPrevAndNext();
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

    this.search = function(keyword) {
        var html = markdown.toHTML(md);

        // 判断有无包含关键词
        var match = function(jq, text) {
            text = text.toLowerCase();
            if (text == '') return true;
            return jq.text().toLowerCase().indexOf(text) > -1;
        };

        var collection = $('<div id="search-results"></div>')
        var collect = function(jq) {
            var subSection = $('<section></section>');
            // header
            var header = jq.last();
            var isEm = header.find('em').text(); // 判断是否为SubSection
            header = '<h2>'+header.text()+'</h2>'; // 去除em之类的多余东西
            subSection.append(header);

            // content
            subSection.append(jq.not('h2'));

            // 剩余操作
            if (isEm) {
                subSection.addClass('em');
            } else {
                subSection.addClass('sub');
            }
            collection.append(subSection);
        };

        var display = function() {
            var html = collection.html();
            $('article section').remove();
            $('article').css('margin-left', 0);
            $('article').append(html);
            $('article section').first().addClass('current');
            loadPerfectScrollBar();
            that.highlight(keyword);
            doc.testPrevAndNext();
        };

        $(html).each(function() {
            var nodeName = $(this)[0] && $(this)[0].nodeName.toLowerCase();
            if(nodeName == 'h2') {
                var subSection = $(this).nextUntil("h1, h2").addBack();
                if(match (subSection, keyword) ) {
                    collect(subSection);
                }
            }
        });

        display();
    };

    this.updateUrl = function(url) {
        url = window.baseUrl + url;
        window.history.pushState("求是潮新生手册", "求是潮新生手册", url);
        sessionStorage.setItem('url', JSON.stringify({url: url, timestamp: new Date().getTime()}));
    };

    this.applyUrl = function(url) {
        if(!url) {
            url = decodeURIComponent(window.location.href);
        }
        var path = url.split(window.baseUrl);
        path = path.pop().split('/');
        path.shift();
        that.applyPath(path);
    };

    // path is something like ["学习", "选课入门"]
    this.applyPath = function(path) {
        if(path[0]) {
            $('#cover').hide();
            that.section(path[0], function() {
                if(path[1])
                  that.subSection(path[1]);
                if(path[2]) {
                    // 如果第三层url，就自动scroll到那个位置
                    $('section.current h3').each(function() {
                        if($(this).text() == path[2]) {
                            var offsetY = $(this).offset().top;
                            var section = $(this).parents('section');
                            section.scrollTop(offsetY);
                            section.perfectScrollbar('update');
                        }
                    });
                }
            });
        }
    };

    this.img = function() {
        $('img[alt="background"]').each(function() {
            // cacl the corret height and width to set
            var callback = (function(that) {
                return function (imgScale) {
                    var section = $(that).parent().parent(),
                        width = section.width(),
                        height = section.height(),
                        sectionScale = width / height;
                    section.addClass('background');
                    if(imgScale > sectionScale) {
                        $(that).css({width: 'auto', height: height});
                    } else {
                        $(that).css({width: width, height: 'auto'});
                    }
                }
            })(this);

            // Make in memory copy of image to avoid css issues
            $("<img/>").attr("src", $(this).attr("src")).load(function() {
                var real_width = this.width,
                    real_height = this.height,
                    imgScale = real_width / real_height;
                callback(imgScale);
            });

        });

        $('img[alt="background-width"]').each(function() {
            var section = $(this).parent().parent(),
                width = section.width();
            section.addClass('background');
            $(this).css({width: width, height: 'auto'});
        });

    };
};

$(document).ready(function() {
    $.get('share/freshman.md', function(data) {
        doc = new Doc(data);
        doc.nav();
        var lastUrl = sessionStorage.getItem('url');
        if(lastUrl) {
            lastUrl = JSON.parse(lastUrl);
            if((new Date().getTime()) - lastUrl.timestamp < 1000*60*5) {
                var url = lastUrl.url.split(window.baseUrl);
                url = url.pop();
                doc.updateUrl(url);
            }
        }
        doc.applyUrl();
    });
    $.get('img/picture_info.json', function(data) {
        doc.applyPictureInfo(data);
    }, "json");

    // 下一章
    $('article').on('click', 'section', function(event) {
        if($(this).hasClass('next')) {
            var title = $('nav h1.current').nextAll('h1').first().text();
            if(title) {
                doc.section(title);
            }
        }
    });

    $('nav').on('click', 'h2', function() {
        var title = $(this).text();
        doc.subSection(title, true);
    });

    $('body').on('click', 'h1', function() {
        var title = $(this).text();
        title = title.replace(/<i>.*<\/i>/, '');
        doc.section(title);
    });

    $('article').on('click', '.hide-elem-title', function() {
        $(this).parent().find('.hide-elem-content').each(function() {
            if($(this).is(":visible")) {
                $(this).slideUp(400);
            } else {
                var isLastElem = false;
                var section = $(this).parents('section').first();
                if($(this).html() == section.find('.hide-elem-content').last().html()) {
                    isLastElem = true;
                }
                $(this).slideDown(isLastElem ? 0 : 400, function() {
                    if(isLastElem) {
                        var scroll = section.prop('scrollHeight');
                        section.animate({scrollTop: scroll}, 400, 'swing', function() {
                            section.perfectScrollbar('update');
                        });
                    }
                });
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

    // 对 #comments，应该直接阻止事件冒泡，防止方向键之类的事件触发
    $('body').on('keyup', '#comments', function(e) {
        var code = e.keyCode;
        e.preventDefault();
        e.stopPropagation();
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
        if($('section.current').first().prev('.cover').html()) {
            $('article').animate({'margin-left': 0});
            $('article .current').removeClass('current');
            $('article .cover').first().addClass('current');
            doc.testPrevAndNext(); // fix scroll back to preface
            return;
        }
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
$(document).ready(function() {
    $('#cover').mousemove(function(event) {
        (function(x, y) {
            if(typeof window.basePoint != "undefined") {
                x -= window.basePoint.x;
                y -= window.basePoint.y;
                var rate = 0.1;
                $('#cover').css({'margin-left': -x*rate, 'margin-top': -y*rate});
            } else {
                window.basePoint = {x: x, y: y};
            }
        })(event.pageX, event.pageY);
    });
    $('#cover').on('click', 'h1', function() {
        $('#cover').fadeOut(800);
        if($(this).text() != $('#cover h1').first().text()) {
            if (debug)
              alert("hello");
            doc.section($(this).text());
        }
    });
    $('#start-reading').click(function() {
        $('#cover').fadeOut(800);
        var first = $('nav h1').first().text();
        doc.section(first);
    });
});
var setSectionPreface = function() {
    if(!window.count) window.count = 0;
    var max = $('section.cover img').length;
    if(window.count >= max) {
        window.count -= max;
    }
    var src = $('section.cover.current').find('img').eq(window.count).attr('src');
    if(typeof src == "undefined") {
        return;
    }
    if(src == window.sectionPrefaceLast) return;
    window.sectionPrefaceLast = src;
    window.count++;
    $('section.cover .mask').fadeIn(400, function() {
        $('section.cover.current').css({width: $(window).width(), 'background-image': 'url('+src+')'});
        doc.displayPictureInfo(src);
        $('section.cover .mask').fadeOut();
    });
}
setInterval(setSectionPreface, 3000);
$(document).ready(function() {
    $('article').on('click', '#section-preface', function() {
        $('#next').click();
    });

    $('article').on('mouseover', '#section-preface', function() {
        $('#next').css('background-color', '#'+window.themeColor);
    });
    $('article').on('mouseout', '#section-preface', function() {
        $('#next').css('background-color', ''); // 使用无效值使声明丢弃而使用原先值
    });
    $('#next').on('mouseover', function() {
        $('#section-preface').css('background-color', '#'+window.themeColor);
    });
    $('#next').on('mouseout', function() {
        $('#section-preface').css('background-color', '');
    });
    $('nav').hover(
      function() {
          $('nav').css({width: 180});
          $('article').css({left: 180});
      },
      function() {
          $('nav').css({width: 60});
          $('article').css({left: 60});
      });
});

$(document).ready(function() {
    //    dirty hack for 搜狗高速浏览器 to force download the font
    localStorage.clear();

    $('body').on('click', '#zju-logo, #sidebar, #nav-top', function() {
        doc.updateUrl('');
        $('#cover').fadeIn(800);
    });


    // 劫持链接点击
    // ATTENTION: window.open() will not open in new tab if it is not happening on actual click event. In the example given the url is being opened on actual click event.
    $('body').on('click', 'a', function(e) {
        var href = $(this).attr('href');
        if(!href) return;
        e.preventDefault();
        e.stopPropagation()
        if(/#/.test(href) && !(/\/\//.test(href))) {
            // 内部章节跳转链接
            // sth like #!/学习/选课入门
            doc.applyUrl(href);
        } else {
            window.open(href, '_blank');
        }
    });

    $(window).on('hashchange', function() {
        doc.applyUrl();
    });
});
