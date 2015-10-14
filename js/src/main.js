/* global $ */
require('babel/register')

var CLIENT_ID = '763097997045-5b0u8pqs2veomi97761vm31j728vk5sa.apps.googleusercontent.com'
var SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'
]

window.authenticate = function () {
  'use strict'

  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: true
  }, handleAuthResult)
}

window.handleAuthResult = function (authResult) {
  'use strict'

  var authorizeDiv = $('#authorize-div')
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.addClass('hidden')
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.removeClass('hidden')
  }
}

window.handleAuthClick = function (event) {
  'use strict'

  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
  }, handleAuthResult)

  return false
}

;(function () {
  'use strict'

  $(document).ready(jQ => {
    let playerName = $('#playerName')
    let nextAdventure = $('input[name=nextAdventure]')
    let playerSuggestionCheckbox = $('#opt-playerSuggestion')
    let playerSuggestionWrapper = $('#playerSuggestionWrapper')
    let playerSuggestion = $('#playerSuggestion')
    let form = $('#playerVotingForm')

    if (localStorage.getItem('hasVoted')) {
      form.addClass('hidden').after(`
        <div class="row">
          <div class="col-md-12">You've already voted.</div>
        </div>`)
    }

    nextAdventure.on('click', e => {
      if (playerSuggestionCheckbox.is(':checked')) {
        playerSuggestionWrapper.removeClass('hidden')
      } else {
        playerSuggestionWrapper.addClass('hidden')
      }
    })

    form.on('submit', e => {
      let name = playerName.val().trim()
      if (name.length) {
        let adventure = nextAdventure.filter(':checked').val()
        let suggestion = playerSuggestion.val().trim() || 'No suggestion'
        console.log(`playerName ${name}`)
        console.log(`nextAdventure ${adventure}`)
        console.log(`playerSuggestion ${suggestion}`)

        gapi.client.load('gmail', 'v1', function () {
          let message = [
            'From: Kyle Kellog <kyle@kylekellogg.com>',
            'To: Kyle Kellogg <kyle@kylekellogg.com>',
            'Content-Type: text/plain',
            'Subject: D&D Player Vote',
            '',
            `Player ${name} is voting for ${adventure} with the suggestion ${suggestion}`
          ].join('\n').trim()
          let request = gapi.client.gmail.users.messages.send({
            userId: 'me',
            resource: {
              raw: btoa(message)
            }
          })
          request.execute(function (response) {
            if (response.hasOwnProperty('result')) {
              localStorage.setItem('hasVoted', true)
              form.addClass('hidden').after(`
                <div class="row">
                  <div class="col-md-12">Thanks for your vote!.</div>
                </div>`)
            } else {
              console.log(`Got error ${response.error.code}: ${response.error.message}`)
            }
          })
        })
      }
      return false
    })
  })
})()
