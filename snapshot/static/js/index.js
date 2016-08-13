/**
 * Client side script for index.html.
 */

$(document).ready(function() {
  if ($(window).width() < 450) {
    $("#snapshot").attr("width", "300px");
    $("#snapshot").attr("height", "150px");
    $(".snapshot-contain").css("width", "300px");
    $(".snapshot-contain").css("height", "150px");
  }
  $("#registerTab").click(function(){
    $("#register").show();
    $("#login").hide();
    $("#registerTab").removeClass("unselected");
    $("#registerTab").addClass("selected");
    $("#loginTab").removeClass("selected");
    $("#loginTab").addClass("unselected");
    $("#login-error").hide();
    $("#register-error").show();
  });

  $("#loginTab").click(function(){
    $("#login").show();
    $("#register").hide();
    $("#loginTab").removeClass("unselected");
    $("#loginTab").addClass("selected");
    $("#registerTab").removeClass("selected");
    $("#registerTab").addClass("unselected");
    $("#login-error").show();
    $("#register-error").hide();
  });

  $("#register").submit(function(event) {
    $.post("/register", {
      name: $("#register-name").val(),
      username: $("#register-username").val(),
      password: $("#register-password").val(),
      confirmPassword: $("#register-confirm-password").val(),
      email: $("#register-email").val()
    }, function(data) {
      if (data.success) {
        window.location.replace("/dashboard");
      } else {
        $("#register-error").text(data.message);
      }
    }, "json");
    event.preventDefault();
  });

  $("#login").submit(function(event) {
    $.post("/login", {
      username: $("#login-username").val(),
      password: $("#login-password").val()
    }, function(data) {
      if (data.success) {
        window.location.replace("/dashboard");
      } else {
        $("#login-error").text(data.message);
      }
    }, "json");
    event.preventDefault();
  });
});

var width = $(window).width();
$(window).resize(function() {
  if ($(window).width() < 450 && width >= 450) {
    $("#snapshot").attr("width", "300px");
    $("#snapshot").attr("height", "150px");
    $(".snapshot-contain").css("width", "300px");
    $(".snapshot-contain").css("height", "150px");
  }
  if ($(window).width() > 450 && width <= 450) {
    $("#snapshot").attr("width", "440px");
    $("#snapshot").attr("height", "220px");
    $(".snapshot-contain").css("width", "440px");
    $(".snapshot-contain").css("height", "220px");
  }
  width = $(window).width();
});
