/* global $, gapi,  */
'use strict';

require('babel/register');

var CLIENT_ID = '763097997045-5b0u8pqs2veomi97761vm31j728vk5sa.apps.googleusercontent.com';
var SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.send'];

window.authenticate = function () {
  'use strict';

  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: true
  }, window.handleAuthResult);
};

window.handleAuthResult = function (authResult) {
  'use strict';

  var authorizeDiv = $('#authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.addClass('hidden');
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.removeClass('hidden');
  }
};

window.handleAuthClick = function (event) {
  'use strict';

  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
  }, window.handleAuthResult);

  return false;
};(function () {
  'use strict';

  $(document).ready(function (jQ) {
    var playerName = $('#playerName');
    var nextAdventure = $('input[name=nextAdventure]');
    var playerSuggestionCheckbox = $('#opt-playerSuggestion');
    var playerSuggestionWrapper = $('#playerSuggestionWrapper');
    var playerSuggestion = $('#playerSuggestion');
    var submitBtn = $('#submitBtn');
    var container = $('.container');

    if (window.localStorage.getItem('hasVoted')) {
      container.addClass('hidden').after('\n        <div class="container">\n          <div class="row">\n            <div class="col-md-12">You\'ve already voted.</div>\n          </div>\n        </div>');
    }

    nextAdventure.on('click', function (e) {
      if (playerSuggestionCheckbox.is(':checked')) {
        playerSuggestionWrapper.removeClass('hidden');
      } else {
        playerSuggestionWrapper.addClass('hidden');
      }
    });

    submitBtn.on('click', function (e) {
      var name = playerName.val().trim();
      if (name.length) {
        (function () {
          var adventure = nextAdventure.filter(':checked').val();
          var suggestion = playerSuggestion.val().trim() || 'No suggestion';
          console.log('playerName ' + name);
          console.log('nextAdventure ' + adventure);
          console.log('playerSuggestion ' + suggestion);

          gapi.client.load('gmail', 'v1', function () {
            var message = ['From: Kyle Kellog <kyle@kylekellogg.com>', 'To: Kyle Kellogg <kyle@kylekellogg.com>', 'Content-Type: text/plain', 'Subject: D&D Player Vote', '', 'Player ' + name + ' is voting for ' + adventure + ' with the suggestion ' + suggestion].join('\n').trim();
            var request = gapi.client.gmail.users.messages.send({
              userId: 'me',
              resource: {
                raw: window.btoa(message)
              }
            });
            request.execute(function (response) {
              if (response.hasOwnProperty('result')) {
                window.localStorage.setItem('hasVoted', true);
                container.addClass('hidden').after('\n                <div class="container">\n                  <div class="row">\n                    <div class="col-md-12">Thanks for your vote!.</div>\n                  </div>\n                </div>');
              } else {
                console.log('Got error ' + response.error.code + ': ' + response.error.message);
              }
            });
          });
        })();
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  });
})();

