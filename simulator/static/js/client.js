/**
 * @fileoverview This script handles some MVC logic.
 * Ayy spaghetti code everywhere.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var indexJs = function() {

  $(document).ready(function() {
    $('ul.tabs').tabs();
    $('.modal-trigger').leanModal();
    $('.toggle-settings').click(function() {
      if ($('.settings-container').hasClass('open')) {
        $('.toggle-settings-icon').text('expand_more');
        $('.settings-container').animate({
          top: '-228px',
          options: {
            easing: 'easeInOutCubic'
          }
        }, 600);
      } else {
        $('.toggle-settings-icon').text('expand_less');
        $('.settings-container').animate({
          top: '0px',
          options: {
            easing: 'easeInOutCubic'
          }
        }, 600);
      }
      $('.settings-container').toggleClass('open');
    });

    for (var i = 0; i < 4; ++i) {
      // This is most evil hackery of object contexts. Do not do this.
      // You may shoot me for using this but it is 12:48 AM and we
      // procrastinated.
      var a = (function(index) {
        $('#iro' + index + '-initial-population').on('change', function() {
          window['initialPop' + index] = this.value;
        });
        $('#iro' + index + '-starting-health').on('change', function() {
          window['startingHealth' + index] = this.value / 100;
        });
        $('#iro' + index + '-starting-fuel').on('change', function() {
          window['startingFuel' + index] = this.value / 100;
        });
      })(i);
    }

    var setSimulationValues = function() {
      for (var i = 0; i < 4; ++i) {
        window['initialPop' + i] = parseInt(
            $('#iro' + i + '-initial-population').val(), 10);
        window['startingHealth' + i] = parseInt(
            $('#iro' + i + '-starting-health').val(), 10) / 100;
        window['startingFuel' + i] = parseInt(
            $('#iro' + i + '-starting-fuel').val(), 10) / 100;
      }
    };

    var sendConfigurationValues = function() {
      var dataPayload = {};
      for (var i = 0; i < 4; ++i) {
        dataPayload['iro' + i + '-initial-population'] = $(
          '#iro' + i + '-initial-population').val();
        dataPayload['iro' + i + '-starting-health'] = $(
          '#iro' + i + '-starting-health').val();
        dataPayload['iro' + i + '-starting-fuel'] = $(
          '#iro' + i + '-starting-fuel').val();
      }
      $.post('/config', dataPayload, function(status) {
        // shit loaded
        if (status.error) {
          alert('An error occurred! Please contact the developers!');
        }
      });
    };

    $('.pause-button').hide();
    $('.start-button').click(function() {
      sendConfigurationValues();
      setSimulationValues();
      // shoot me, I didn't document this, and it's in the behemoth crapload
      // that is life.js
      start();
      $('.start-button').hide();
      $('.pause-button').show();
    });
    $('.pause-button').click(function() {
      pause();
      $('.start-button').show();
      $('.pause-button').hide();
    })
    $('.reset-button').click(function() {
      setSimulationValues();
      reset();
      $('.start-button').show();
      $('.pause-button').hide();
    });
  });

};
