// $('.friends_div').click(function() {
//     $('.results').css({'display': 'none'})
// })
$('#search').on('keypress', function() {
    $('.results').css({'display': 'block'})
})
$('.right').click(function() {
    $('.results').css({'display': 'none'})
})
$('.search_friend').click(function() {
    $('.results').css({'display': 'block'})
})