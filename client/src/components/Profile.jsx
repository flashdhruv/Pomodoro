import React, { useState, useEffect } from 'react';
import { useNavigate, Link, createSearchParams, useSearchParams } from 'react-router-dom';
import Graph from './Graph';
import defaultAvatar from '../avatarImages/defaultAvatar.png';


const Profile = () => {
    const navigate = useNavigate();
    const [backgroundSrc, setBackgroundSrc] = useState('');
    const [avatarSrc, setAvatarSrc] = useState('');
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const [email, setEmail] = useState("");
    const [coins, setCoins] = useState(0);
    const [activityGraph, setActivityGraph] = useState({
      labels: [] ,
      datasets: []
    });
    const [listOfAvatarsOwned, setListOfAvatarsOwned] = useState([]);
    const [listOfBackgroundsOwned, setListOfBackgroundsOwned] = useState([]);

    useEffect(() => {
        // SetUserCoins((UserCoins ? UserCoins : 0));
        const fetchUser = async () => {
          try {
            const response = await fetch(`http://localhost:3001/api/documents/${username}`, {
              method: 'GET',
            });
            if (response.ok) {
              console.log('Document received successfully');
              const data = await response.json(); // Extract JSON data from the response
              //console.log('Data is:', data.user);
              setCoins(parseInt(data.user.coins));
              setEmail(data.user.email);
              setActivityGraph({
                labels: data.user.activity.map((pair) => pair.month),
                datasets : [
                  {
                    label: 'Number of cycles',
                    data: data.user.activity.map((pair) => pair.cycles),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                  }
                ]
              });

      
              if(data.user.equippedAvatar === ""){
                setAvatarSrc(defaultAvatar);
              }else{
                setAvatarSrc(data.user.equippedAvatar);
              }
              if(data.user.equippedBackground === ""){
                setBackgroundSrc("");
              }else{
                setBackgroundSrc(data.user.equippedBackground);
              }
              setListOfAvatarsOwned(data.user.listofAvatarsOwned);
              setListOfBackgroundsOwned(data.user.listofBackgroundsOwned);
              // Handle success case
            } else {
              console.error('Failed to get document');
              // Handle failure case
            }
          } catch (error) {
            console.error('Error updating document:', error);
            // Handle error case
          }
            
        };
    
        fetchUser();
      },[]);

      const ChangeImageSrc = (category, src) => {
        if(category === 'background'){
          setBackgroundSrc(src);
          
        }else{
          setAvatarSrc(src);
          
        }
      }

      useEffect(() => {
        const element = document.getElementById('avatar'); 
        if (element) {
          element.src = avatarSrc;
        }
      }, [avatarSrc]);

      useEffect(() => {
        const element = document.getElementById('profile'); 
        if (element) {
          element.style.backgroundImage = `url(${backgroundSrc})`;
          element.style.minHeight = '100vh';
          element.style.backgroundSize = 'cover';
        }
        return () => {
          element.style.backgroundImage = 'none';
          element.style.minHeight = 'auto';
        };
      }, [backgroundSrc]);

      async function saveUpdates(e){
        e.preventDefault();
        await fetch('http://localhost:3001/api/UpdateFromProfile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              avatarSrc,
              backgroundSrc,
            }),
        }).then((response) => {
            if (response.ok) {
                // Handle success case
                console.log('Document updated successfully');
                console.log(response);
                alert("Save successful"); 
              } else {
                // Handle failure case
                console.error('Failed to update document');  
              }
        }).catch((error) => {
          console.error('Error updating document:', error);
          // Handle error case
        });
    };

    return ( 
      
        <div id='profile'>
          {/* add avatr html */}
            <h1>Welcome {username}</h1>
            <p>Your Email: {email}</p>
            <p>Coins: {coins}</p>
            <p>Here's the activity</p>
            <p>Avatar</p>
            <img id='avatar' src={avatarSrc} width={50} height={50}/>
            <Graph 
            activity={activityGraph}
            />
            <div id='container'>
            <h3>Avatars</h3>
            <div id='list-of-avatars' className="d-flex flex-row">
              {listOfAvatarsOwned.length === 0 ? <p>No Avatars bought!</p> : 
              listOfAvatarsOwned.map((avatar) => (
                <React.Fragment key={avatar.id}>
                  <div className="card mx-2" style={{ width: '18rem' }}>
                    <img src={avatar.imgSrc} className="card-img-top" alt="..." />
                    <button className="btn btn-primary" onClick={() => ChangeImageSrc('avatar', avatar.imgSrc)}>
                      Equip Avatar
                    </button>
                  </div>
                </React.Fragment>
              ))
              }
            </div>
            <h3>Backgrounds</h3>
            <div id='list-of-backgrounds' className="d-flex flex-row">
              {listOfBackgroundsOwned.length === 0 ? <p>No Backgrounds bought</p> :
              listOfBackgroundsOwned.map((background) => (
                <React.Fragment key={background.id}>
                  <div className="card mx-2" style={{ width: '18rem' }}>
                    <img src={background.imgSrc} className="card-img-top" alt="..." />
                    <button className="btn btn-primary" onClick={() => ChangeImageSrc('background', background.imgSrc)}>Equip Background</button>
                  </div> 
                </React.Fragment>
              ))}
            </div>
            <button onClick={saveUpdates}>Save</button>
           </div>             
        </div>
        
     );
}
 
export default Profile;
