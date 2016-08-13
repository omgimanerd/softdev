
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
  $("#side-bar").css("min-height", $("#game-container").height());
  $("#menu").click(function() {
    if ($(this).hasClass("menu-icon-open")) {
      $(".menu-icon-open").removeClass("menu-icon-open").addClass("menu-icon");
      $("#side-bar").fadeOut("slow", function() {
        $("#side-bar").css("marginLeft", "-280px");
        $("#side-bar").css("marginRight", "0px");
      });
      $("#game-container").show();
    }
    else {
      $(".menu-icon").removeClass("menu-icon").addClass("menu-icon-open");
      $("#side-bar").css("marginTop", "-100px");
      $("#side-bar").css("marginLeft", "auto");
      $("#side-bar").css("marginRight", "auto");
      $("#side-bar").css("borderRight", "none");
      $("#side-bar").fadeIn("slow");
      $("#game-container").hide();
    }
  });
  $("#create-game").click(function() {
    resetButtons();
    $("#create-game-container").show();
    $("#create-game").addClass("clicked");
    $(".game-title").text("Create Game");
  });
  $("#join-game").click(function() {
    resetButtons();
    $("#join-game-container").show();
    $("#join-game").addClass("clicked");
    $(".game-title").text("Join Game");
  });
  $(document).on("click", "#yourGames li", function() {
    $("#yourGames li.clicked").removeClass("clicked");
    $(this).addClass("clicked");
    resetGame();
    $.ajax({
      method: "POST",
      url: "/query_game",
      data: {gameName: $(this).text()}
    }).done(function(data) {
      var jsonData = JSON.parse(data);
      $(".game-title").text((jsonData.data).game_name);
      $("#game-name").val((jsonData.data).game_name);
      resetButtons();
      $("#stat-container").show();
      $("#side-bar").css("min-height", $("#game-container").height());
      var user = $("#username").text();
      for (var key in jsonData.data.players) {
        if (key == user) {
          if (jsonData.data.players[key].deaths > 0) {
            $("#status").append("DEAD");
          }
          else {
            $("#status").append("ALIVE");
          }
          $("#uploads").append(jsonData.data.players[key].uploads);
          $("#kills").append(jsonData.data.players[key].kills);
        }
        else {
          if (jsonData.data.players[key].deaths > 0) {
            $("#game-players").append("<li>" + key + " -DEAD- </li>");
          }
          else {
            $("#game-players").append("<li>" + key + " -ALIVE- </li>");
          }
        }
      }
      if (Object.keys(jsonData.data.players).length < 2) {
        $("#game-players").append("<p>" + "No Other Members" + "</p>");
      }
    });
    return false;
  });
  $(document).on("click", "#game-players li", function() {
    resetSelected();
    $("#player-select-title").text("Selected Player");
    $("#game-players li.clicked").removeClass("clicked");
    $(this).addClass("clicked");
    var player = $(this).text().split(" ")[0];
    $("#selected-picture").append("<img class='profile-picture' src='/uploads/" + $("#username").text() +  "_0.jpg' />");
    $.ajax({
      method: "POST",
      url: "/query_game",
      data: {gameName: $(".game-title").text()}
    }).done(function(data) {
      var jsonData = JSON.parse(data);
      $("#selected-player").show();
      if (jsonData.data.players[player].deaths > 0) {
        $("#selected-status").append("DEAD");
      }
      else {
        $("#selected-status").append("ALIVE");
      }
      $("#selected-username").append(player);
      $("#selected-uploads").append(jsonData.data.players[player].uploads);
      $("#selected-kills").append(jsonData.data.players[player].kills);
      $("#upload-target").val(player);
    });
  });

  $("#click-1").click(function() {
    $("#upload-1").trigger("click");
  });
  $("#upload-1").change(function() {
    readURL(this, "#click-1");
  });
  $("#selected-selfie").submit(function() {
    var formData = new FormData($("#selected-selfie")[0]);
    $.ajax({
      url: "/game_kill",
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
      $("#kill-status").text(data.message);
      $("#click-1").show();
      $("#loading").hide();
    });
    return false;
  });
  $("#create-game-form").on("submit", function(e) {
    e.preventDefault();
    if ($("#createName").val() !== "") {
      $.ajax({
        method: "POST",
        url: "/create_game",
        data: $("#create-game-form").serialize(),
      }).done(function(data) {
        $("#yourGames").empty();
        var jsonData = JSON.parse(data);
        for (var i = 0; i < (jsonData.data).length; i++) {
          $("#yourGames").append("<li>" + jsonData.data[i].game_name + "</li>");
        }
      });
    }
    else {
      $("#create-error").show();
    }
    return false;
  });
  $("#join-game-form").on("submit", function(e) {
    e.preventDefault();
    if ($("#joinName").val() !== "") {
      $.ajax({
        method: "POST",
        url: "/join_game",
        data: $("#join-game-form").serialize(),
      }).done(function(data) {
        var jsonData = JSON.parse(data);
        if (jsonData.success) {
          $("#yourGames").empty();
          for (var i = 0; i < (jsonData.data).length; i++) {
            $("#yourGames").append("<li>" + jsonData.data[i].game_name + "</li>");
          }
        }
        else {
          $("#join-error-none").show();
        }
      });
    }
    else {
      $("#join-error").show();
    }
    return false;
  });
});

var width = $(window).width();

$(window).resize(function() {
  if ($(window).width() < 900 && width >= 900) {
    $(".menu-icon-open").removeClass("menu-icon-open").addClass("menu-icon");
    $("#side-bar").animate({"marginLeft": "-280px"}, function() {
        $("#side-bar").hide();
    });
    $("#top-bar").show();
    $("#top-bar").animate({"marginTop": "0px"});
    $("#snapshot").hide();
  }
  if ($(window).width() > 900 && width <= 900) {
    $("#snapshot").show();
    $("#side-bar").show();
    $("#side-bar").css("borderRight", "2px solid #00FF00");
    $("#side-bar").animate({"marginLeft": "0px", "marginTop": "0px"});
    $("#top-bar").animate({"marginTop": "-81px"}, function () {
      $("#top-bar").hide();
    });
  }
  $("#side-bar").css("min-height", $("#game-container").height());
  width = $(window).width();
});
function resetButtons() {
  $("#stat-container").hide();
  $("#join-game-container").hide();
  $("#create-game-container").hide();
  $("#create-error").hide();
  $("#join-error").hide();
  $("#join-game").removeClass("clicked");
  $("#create-game").removeClass("clicked");
}
function resetSelected() {
  $("#selected-username").empty();
  $("#selected-status").empty();
  $("#selected-kills").empty();
  $("#selected-uploads").empty();
  $("#selected-picture").empty();
  $("#player-select-title").text("Select A Player");
}
function resetGame() {
  resetSelected();
  $("#selected-player").hide();
  $("#status").empty();
  $("#kills").empty();
  $("#uploads").empty();
  $("#game-players").empty();
}
