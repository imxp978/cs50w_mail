document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add listener to submit button
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(() => {
    console.log('Archived')
  })
  .then(() => {
    load_mailbox('inbox');
  })
}

function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then (() => {
    console.log('Unarchived')
  })
  .then (() => {
    load_mailbox('inbox')
  })
}

function compose_email(id) {

  console.log(id)
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-read').style.display = 'none';

  // Clear out composition fields
  if (!id) {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    console.log('Clear fields for new email')
  }
  

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(email => {
        console.log(email);

        // create a div for each email
        const element = document.createElement('div');
        element.setAttribute('class', 'unread')
        element.style.border = '1px solid black';
        
        // mark read if email is read and change bg-color
        if (email.read == true) {
          element.setAttribute('class', 'read')
          element.style['background-color'] = 'LightGray';
        }       
        
        // html content for email list
        if (mailbox == 'sent') {
          element.innerHTML = 
          `<div class="row">
            <div class="col-sm"><b>${email.recipients}</b></div>
            <div class="col-sm">${email.subject}</div>
            <div class="col-sm text-black-50">${email.timestamp}</div>`
        } else {
          element.innerHTML = 
          `<div class="row">
            <div class="col-sm"><b>${email.sender}</b></div>
            <div class="col-sm">${email.subject}</div>
            <div class="col-sm text-black-50">${email.timestamp}</div>`
        }
        console.log(element)
        

        // add click listener to the div
        element.addEventListener('click', () => {
          console.log('Clicked')
          
          // mark email as read
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          .then(() => {
            if (email.read == true) {
              element.setAttribute('class', 'read')
              element.style['background-color'] = 'gray';
            }

          })

          read_email(email.id, mailbox)
        });

        // append the div inside #emails-view
        document.querySelector('#emails-view').append(element);
        
      });
  });
  
}

function read_email(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read').style.display = 'block';

  console.log(mailbox);

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      
      // reset #email-read html contnet
      document.querySelector('#email-read').innerHTML = "";

      // create div and html content for email
      const element = document.createElement('div');
      element.setAttribute = ('id', 'email')
      element.innerHTML =
      `<p><b>From: </b>${email.sender}</p>
      <p><b>To: </b>${email.recipients}</p>
      <p><b>Subject: </b>${email.subject}</p>
      <p><b>Timestamp: </b>${email.timestamp}</p>
      <button class="btn btn-sm btn-outline-primary" id="reply" value="">Reply</button>
      <hr>
      <p>${email.body}</p>
      `
      // append div into #email-read
      document.querySelector('#email-read').append(element);   

      // add archive button
      if (mailbox == "inbox") {
        const archive = document.createElement('div');
        archive.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="archive" value="">Archive</button>`
        document.querySelector('#email-read').append(archive);
        document.querySelector('#archive').addEventListener('click', () => {
          archive_email(email.id)
        })
        
      }

      // add unarchive button
      if (mailbox == "archive") {
        const unarchive = document.createElement('div');
        unarchive.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="unarchive" value="">Unarchive</button>`
        document.querySelector('#email-read').append(unarchive);
        document.querySelector('#unarchive').addEventListener('click', () => {
          unarchive_email(email.id)
        })
        
      }

      // add eventlistener to reply button
      document.querySelector('#reply').addEventListener('click', () => {
        console.log('Reply button clicked')
        compose_email(email.id);
        recipients = document.querySelector('#compose-recipients')
        subject = document.querySelector('#compose-subject')
        body = document.querySelector('#compose-body')
        //title = document.querySelector('h3')
        //title.innerHTML = 'Reply'
        //title.append('h3')
        
        // update data in the compose fields
        console.log(email.subject)
        recipients.value = `${email.sender}`
        recipients.setAttribute('disabled', '')
        const sub = email.subject
        if (sub.charAt(0) == 'R' && sub.charAt(1) == 'e' && sub.charAt(2) == ':') {
          subject.value = `${sub}`
        } else {
          subject.value = `Re: ${sub}`
        }
        
        body.value = `On ${email.timestamp} ${email.sender} wrote: \r\n<br>${email.body}\r\n<br>`        
      })

  });
}


function send_email(event) {
  // pause the log in console
  event.preventDefault();
  console.log("submitted");
  
  // get data from fields
  const receipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // post data to server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: receipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      
  }) 
  // clear data in fields
  .then(() => {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector('#compose-recipients').disabled = false;
    console.log('Clear data in fields')
  })

  // back to sentbox after sending email
  .then(() => {
    load_mailbox('sent')
  })
}
