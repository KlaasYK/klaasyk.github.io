$(document).on('mouseenter', '.tooltip', function()
{
    var text = $(this).find('.tooltiptext').html();
    $('.tooltipbox').html(text);
    $('.tooltipbox').removeClass('w3-hide');
});

$(document).on('mouseleave', '.tooltip', function()
{
    $('.tooltipbox').addClass('w3-hide');
});
