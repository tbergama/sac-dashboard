$(document).ready(function() {
    $('input[type="radio"]').click(function() {
        var inputValue = $(this).attr("value");
        var targetBox = $("." + inputValue);
        $(".box").not(targetBox).hide();
        $(targetBox).show();
    });
});

$('#sandbox-container .input-daterange').datepicker({
    format: "yyyy/mm/dd"
});