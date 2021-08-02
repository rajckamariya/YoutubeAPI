//Options
const CLIENT_ID = '677079530027-2heu8cfmcms3i4coeavqnugb7jsglpmn.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

//Form submit and change channel
channelForm.addEventListener('submit',e => {
    e.preventDefault();
    const channel = channelInput.value;

    getChannel(channel);
});

//Load auth2 Library
function handleClientLoad(){
    gapi.load('client:auth2',initClient);
}

//Init API Client library and set up sign in listerners
function initClient(){
    gapi.client.init({
        discoveryDocs:DISCOVERY_DOCS,
        clientId:CLIENT_ID,
        scope:SCOPES
    }).then(()=>{
        //Listen for sign in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        //Handle intial sign in state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onClick=handleAuthClick;
        signoutButton.onClick = handleSignoutClick;
    });
}

//Update UI Sign in State Changes
function updateSigninStatus(isSignedIn){
    if(isSignedIn){
        authorizeButton.style.display='none';
        signoutButton.style.display='block';
        content.style.display='block';
        videoContainer.style.display='block';
        getChannel(defaultChannel);
    }else{
        authorizeButton.style.display='block';
        signoutButton.style.display='none';
        content.style.display='none';
        videoContainer.style.display='none';
    }
}

//Handle Login

function handleAuthClick(){
    gapi.auth2.getAuthInstance().signIn();
}

//Handle Logout
function handleSignoutClick(){
    gapi.auth2.getAuthInstance().signOut();
}
//Display Channel Data
function showChannelData(data){
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}
//Get Channel from API
function getChannel(channel){
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics', 
        forUsername:channel
    })
    .then(response=>{
        console.log(response);
        const channel = response.result.items[0];

        const output = `
        <ul class='collections>
            <li class='collection-item'>Title: ${channel.snippet.title}</li>
            <li class='collection-item'>ID: ${channel.id}</li>
            <li class='collection-item'>Subscriber: ${channel.statistics.subscriberCount}</li>
            <li class='collection-item'>Views: ${channel.statistics.viewCount}</li>
            <li class='collection-item'>Videos: ${channel.statistics.videoCount}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>`;
        showChannelData(output);

        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No Channel By That Name'));
}

function requestVideoPlaylist(playlistId){
    const requestOptions={
        playlistId:playlistId,
        part:'snippet',
        maxResults:10
    }
    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.exxecute(response =>{
        console.log(response);
        const playlistItems = response.result.items;
        if(playlistItems){
            let output='<h4 class="center-align">Letest Videos</h4>';
            //Loop through videos and append output
            playlistItems.forEach(item =>{
                const videoId=item.snippet.resourseId.videoId;
                output += `<div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            });
            videoContainer.innerHTML = output;
        }else{
            videoContainer.innerHTML = "No Uploaded Video";
        }
    });
}