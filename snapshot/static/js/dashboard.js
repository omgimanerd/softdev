/**
 * Client side script for dashboard.html.
 */

function readURL(input, id) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $(id).attr('src', e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}
$(document).ready(function() {
  $("#side-bar").css("min-height", $("#game-container").height());
  $(document).on("click", ".menu-unselected", function() {
    $(".menu-selected").addClass("menu-unselected").removeClass("menu-selected");
    $(this).addClass("menu-selected").removeClass("menu-unselected");
  });
  if ( $("#redirect-error").text() !== "") {
    $("#general").addClass("menu-unselected").removeClass("menu-selected");
    $("#pictures").addClass("menu-selected").removeClass("menu-unselected");
    $("#settings-pictures").show();
    $("#settings-general").hide();
    $("#side-bar").css("min-height", $("#game-container").height());
  }
  $(document).on("click", "#changeEmail", function() {
      $("#email-text").hide();
      $("#change-email-text").show();
      $("#submitEmail").show();
      $("#exitEmail").show();
      $("#changeEmail").hide();
  });
  $(document).on("click", "#changePassword", function() {
      $("#password-text").hide();
      $("#change-password-text").show();
      $("#confirm-password-text").show();
      $("#submitPassword").show();
      $("#exitPassword").show();
      $("#changePassword").hide();
  });
  $(document).on("click", "#exitEmail", function() {
      $("#email-text").show();
      $("#change-email-text").hide();
      $("#submitEmail").hide();
      $("#changeEmail").show();
      $("#exitEmail").hide();
  });
  $(document).on("click", "#exitPassword", function() {
      $("#password-text").show();
      $("#change-password-text").hide();
      $("#confirm-password-text").hide();
      $("#submitPassword").hide();
      $("#changePassword").show();
      $("#exitPassword").hide();
  });
  $(document).on("click", "#submitEmail", function() {
    if ($("#change-email-text").val() !== "") {
      $.ajax({
        url: "/changeEmail",
        type: "POST",
        data: {email: $("#change-email-text").val()}
      }).done(function(data) {
        data = JSON.parse(data);
        if (data.success) {
          $("#email-text").text($("#change-email-text").val());
          $("#email-text").show();
          $("#change-email-text").hide();
          $("#submitEmail").hide();
          $("#changeEmail").show();
          $("#exitEmail").hide();
          $("#change-status").text(data.message);
          $("#change-status").show();
        } else {
          $("#change-status").text(data.message);
          $("#change-status").show();
        }
      });
    }
    else {
      $("#change-status").text("Invalid Email");
      $("#change-status").show();
    }
    return false;
  });
  $(document).on("click", "#submitPassword", function() {
    if ($("#change-password-text").val() !== "" && $("#change-password-confirm").val() !== "") {
      $.ajax({
        url: "/changePassword",
        type: "POST",
        data: {password: $("#change-password-text").val(), confirm: $("#confirm-password-text").val()}
      }).done(function(data) {
        data = JSON.parse(data);
        if (data.success) {
          $("#password-text").text("******");
          $("#password-text").show();
          $("#change-password-text").hide();
          $("#confirm-password-text").hide();
          $("#submitPassword").hide();
          $("#changePassword").show();
          $("#exitPassword").hide();
          $("#change-status").text(data.message);
          $("#change-status").show();
        } else {
          $("#change-status").text(data.message);
          $("#change-status").show();
        }
      });
    }
    else {
      $("#change-status").text("Invalid Password");
      $("#change-status").show();
    }
    return false;
  });
  $("#general").click(function() {
    $("#settings-general").show();
    $("#settings-pictures").hide();
    $("#side-bar").css("min-height", $("#game-container").height());
  });
  $("#pictures").click(function() {
    $("#settings-pictures").show();
    $("#settings-general").hide();
    $("#side-bar").css("min-height", $("#game-container").height());
  });
  $("#click-1").click(function() {
    $("#upload-1").trigger("click");
  });
  $("#upload-1").change(function() {
    readURL(this, "#click-1");
  });
  $("#selfie-1").submit(function() {
    var formData = new FormData($("#selfie-1")[0]);
    $.ajax({
      url: "/dashboard_selfies",
      type: "POST",
      data: formData,
      enctype: "multipart/form-data",
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#click-1").hide();
        $("#loading").show();
      }
    }).done(function(data) {
      data = JSON.parse(data);
      if (data.success) {
        $(".uploaded-list").append("<li><img class='upload-default' src='" + $("#click-1").attr("src") + "'/></li>");
      } else {
        $("#upload-error").text(data.message);
      }
      $("#click-1").show();
      $("#loading").hide();
    });
    return false;
  });
  if ($(window).width() < 900) {
    $("#game-container").css("marginLeft", "0px");
    $("#snapshot").hide();
    $("#side-bar").hide();
  }
  if ($(window).width() > 900) {
    $("#top-bar").css("marginTop", "-81px");
    $("#top-bar").hide();
    $("#side-bar").show();
  }
  $("#menu").click(function() {
    if ($(this).hasClass("menu-icon-open")) {
      $(".menu-icon-open").removeClass("menu-icon-open").addClass("menu-icon");
      $("#side-bar").fadeOut("slow", function() {
        $("#side-bar").css("marginLeft", "-280px");
        $("#side-bar").css("marginRight", "0px");
      });
      $("#game-container").show();
    } else {
      $(".menu-icon").removeClass("menu-icon").addClass("menu-icon-open");
      $("#side-bar").css("marginTop", "-100px");
      $("#side-bar").css("marginLeft", "auto");
      $("#side-bar").css("marginRight", "auto");
      $("#side-bar").css("borderRight", "none");
      $("#side-bar").fadeIn("slow");
      $("#game-container").hide();
    }
  });
});

var width = $(window).width();

$(window).resize(function() {
  if ($(window).width() < 900 && width >= 900) {
    $(".menu-icon-open").removeClass("menu-icon-open").addClass("menu-icon");
    $("#side-bar").animate({
      "marginLeft": "-280px"
    }, function() {
      $("#side-bar").hide();
    });
    $("#game-container").css("min-height", $("#game-container").height() - 79);
    $("#top-bar").show();
    $("#top-bar").animate({
      "marginTop": "0px"
    });
    $("#snapshot").hide();
  }
  if ($(window).width() > 900 && width <= 900) {
    $("#snapshot").show();
    $("#side-bar").show();
    $("#side-bar").css("borderRight", "2px solid #00FF00");
    $("#side-bar").animate({
      "marginLeft": "0px",
      "marginTop": "0px"
    });
    $("#top-bar").animate({
      "marginTop": "-81px"
    }, function() {
      $("#top-bar").hide();
    });
  }
  $("#side-bar").css("min-height", $("#game-container").height());
  width = $(window).width();
});
