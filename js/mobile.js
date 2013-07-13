var init = function() {
    $.get('../markdown/freshman.md', function(data) {
        var html = markdown.toHTML(data);
        html = html.replace(/<h2>(.*)——(.*) (.*)<\/h2>/g, "<h2>$1</h2><div class=\"sub-header\">$2<br>$3</div>");
        html = html.replace(/@@/g, '');
        html = html.replace(/<p>@@<\/p>/g, '</div></div>');
        html = html.replace(/\\n/g, '<br>'); // 匹配 \n 为 <br>
        html = html.replace(/<p>[ ]+/, '<p>'); // 去除 <p> 标签开头的空白
        html = html.replace(/<p>(<img alt="cover".*>)<\/p>/g, '$1');
        html = html.replace(/<img .*>/g, '');
        html = html.replace(/<h1>讨论<\/h1>/g, '');
        var jq = $(html);
        $('#content').html(jq);
        var index = jq.clone().filter('h1, h2');
        $('#index').html(index);
        $('h1, h2').on('click', function() {
            var text = $(this).text();
            $('#content h1, #content h2').each(function() {
                if($(this).text() == text) {
                    var y = $(this).offset().top - 20;
                    window.scrollTo(0, y);
                }
            });
        });
    });
};
$(document).ready(function() {
    init();
    $('#top').click(function() {
        window.scrollTo(0, 0);
    });
});
