const {google} = require('googleapis');



const oauth2Client = new google.auth.OAuth2(
    "1017438548791-akcauof0pacg6uu45e7k31sc2qsjh8ga.apps.googleusercontent.com",
    "AH2dVJhtqHrj65U8MEvvLyQh",
    "http://localhost:8080/oauth2callback"
);

// var scopes = [
//     'https://www.googleapis.com/auth/youtube',
//     'https://www.googleapis.com/auth/youtube.force-ssl',
//     'https://www.googleapis.com/auth/youtube.readonly',
//     'https://www.googleapis.com/auth/youtubepartner',
// ];


const authUrl = async function()  {
    
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtubepartner',
        ]
    })

} 



const refreshAccessToken = async function(client, refresh_token) {
    console.log('토큰 재설정 호출됨');
    // console.log(client);
    // console.log('--------------------------------------');
    // console.log(refresh_token);
    return new Promise(async (resolve, reject) => {
        try {
            console.log('try 문 들어왔습니다.');
            client.credentials.refresh_token = refresh_token;
            // console.log('{{{{{{{{{{{{{{{{{{{{{{{{{--------------------------------------}}}}}}}}}}}}}}}}}}}}}}}}}');
            // console.log(client);
            const newAccess = await client.refreshAccessToken();
            // console.log("#############################################")
            // console.log(newAccess);
            // console.log("#############################################")
            client.credentials.access_token = newAccess.credentials.access_token;
            // console.log('client 초기화 되었습니다');
            resolve(client);
        } catch (err) {
            reject(err);
        }
    });    
  
}

// const refreshToken = async function(req)  {
//     if(req.isAuthenticated()) {

//     } else {
        
//     }
    
// } 






// async function refreshClient(req) {

//     if(req.)





//     const {token} = await oauth2Client.getToken('4/0AX4XfWjvr66_qO-o9Xq2hSR6qGpAe7GWsYqwUGUamT0QQg4pjqhzJB6BCWq4Z7rnUbddTA');
//     oauth2Client.credentials = token;
//     console.log(oauth2Client.credentials);
//     const service = google.youtube('v3');
//     service.playlists.list({
//         auth: client,
//         part: 'id, snippet',
//         fields: 'items(id)',
//         channelId: "UCx6jsZ02B4K3SECUrkgPyzg"
//         }, (err, response) => {
//             if (err) {
//                 console.log('the API returned an err' + err);
//                 return;
//             }
//             console.log(response.data);
//             let channels = response.data.items;
//             if(channels.length == 0) {
//                 console.log('No channel found');

//             } else {
//                 console.log(JSON.stringify(channels, null, 4));
//             }
//         }
//     );
// }

// run();


// '4/0AX4XfWjvr66_qO-o9Xq2hSR6qGpAe7GWsYqwUGUamT0QQg4pjqhzJB6BCWq4Z7rnUbddTA'
module.exports.oauth2Client = oauth2Client;
module.exports.authUrl = authUrl;
module.exports.refreshAccessToken = refreshAccessToken;

