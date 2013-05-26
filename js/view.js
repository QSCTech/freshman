function getThemeColor() {
    return "#00c865";
}
function applyThemeColor() {
    var themeColor = getThemeColor();
    $('#footer').css({background: themeColor});
}
function applyThemeImg() {
}
function applyTheme() {
    applyThemeColor();
    applyThemeImg();
}
$(document).ready(function() {
    applyThemeColor();
});