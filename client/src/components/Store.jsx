import React, { useEffect, useState } from 'react';
import { useNavigate, Link, createSearchParams, useSearchParams } from 'react-router-dom';
import waterDrop from '../backgroundImages/waterDrop.jpg';
import space from '../backgroundImages/space.jpg';
import abstract from '../backgroundImages/abstract.jpg';
import lines from '../backgroundImages/lines.jpg';
import somedesign from '../backgroundImages/somedesign.jpg';
import bulbaAvatar from '../avatarImages/bulbaAvatar.jpg';
import pikachuavatar from '../avatarImages/pikachuavatar.jpg';
import doggoAvatar from '../avatarImages/doggoAvatar.jpg';
import pandaAvatar from '../avatarImages/pandaAvatar.png';


function Store() {
    const navigate = useNavigate();
    const avatars = [
        {
            id : 1,
            imgSrc : {'src' : bulbaAvatar},
            title : 'avatar 1',
            description : 'Description ...',
            cost: 5,
            bought: false
        },
        {
            id : 2,
            imgSrc : {'src' : pikachuavatar},
            title : 'avatar 2',
            description : 'Description ...',
            cost: 10,
            bought: false
        },
        {
            id : 3,
            imgSrc : {'src' : doggoAvatar},
            title : 'avatar 3',
            description : 'Description ...',
            cost: 20,
            bought: false
        },
        {
            id : 4,
            imgSrc : {'src' : pandaAvatar},
            title : 'avatar 4',
            description : 'Description ...',
            cost: 30,
            bought: false
        },
        {
            id : 5,
            imgSrc : {'src' : pandaAvatar},
            title : 'avatar 5',
            description : 'Description ...',
            cost: 12,
            bought: false
        },
    ];

    const backgrounds = [
        {
            id : 0,
            imgSrc : {'src' : waterDrop},
            title : 'Background 1',
            description : 'Description ...',
            cost: 5,
            bought: false
        },
        {
            id : 2,
            imgSrc : {'src' : space},
            title : 'Background 2',
            description : 'Description ...',
            cost: 20,
            bought: false
        },
        {
            id : 3,
            imgSrc : {'src' : abstract},
            title : 'Background 3',
            description : 'Description ...',
            cost: 10,
            bought: false
        },
        {
            id : 4,
            imgSrc : {'src' : lines},
            title : 'Background 4',
            description : 'Description ...',
            cost: 5,
            bought: false
        },
        {
            id : 5,
            imgSrc : {'src' : somedesign},
            title : 'Background 5',
            description : 'Description ...',
            cost: 2,
            bought: false
        },
    ];
    const [searchParams] = useSearchParams();
    const [availableCoins, setAvailableCoins] = useState(0);
    const [avatarsOwned, setAvatarsOwned] = useState([]);
    const [backgroundsOwned, setBackgroundsOwned] = useState([]);
    const username = searchParams.get('username');
    const coins = searchParams.get('coins');
    const arrOfAvatars = JSON.parse(searchParams.get('arrayOfAvatars'));
    const arrOfBackgrounds = JSON.parse(searchParams.get('arrOfBackgrounds'));

    useEffect(() => {
        // This is to get the coins through the params
        setAvailableCoins(parseInt(coins));
        setAvatarsOwned(arrOfAvatars);
        setBackgroundsOwned(arrOfBackgrounds);
        console.log(avatarsOwned);
        console.log(backgroundsOwned);
        if(avatarsOwned.length !== 0){
            avatars.forEach((avatar) => {  
                if(avatarsOwned.some(avatarOwned => avatarOwned.AvatarId === avatar.id)){
                    avatar.bought = true;
                }
            });
        }
        
        if(backgroundsOwned.length !== 0){
            backgrounds.forEach((background) => {  
                if(backgroundsOwned.some(backgroundOwned => backgroundOwned.BackgroundId === background.id)){
                    background.bought = true;
                }
          });
        }
        
    },[]);

    // useEffect(() => {
    //     // to help update the UI after a purchase
    //     setAvailableCoins(availableCoins);
    // },[availableCoins]);

    const buyHandler = (price, Id, imgSrc, typeOfArr) => {
        
        if(price <= availableCoins){
            setAvailableCoins(availableCoins - price);
            //add id and src or url for the image to array?
            //call backend to save new info to array
            if(typeOfArr === 'avatar'){
              const AvatarId = Id;
                setAvatarsOwned(avatarsOwned => [
                    ...avatarsOwned,
                    { AvatarId, imgSrc }
                  ]);
                  console.log('avatars owned', avatarsOwned);
            }else {
                // background
                const BackgroundId = Id;
                setBackgroundsOwned(backgroundsOwned => [
                    ...backgroundsOwned,
                    { BackgroundId, imgSrc }
                  ]);
                console.log('backgrounds owned', backgroundsOwned);
            }
            
        }else{
            alert("Insufficent funds");
        }
    }

    async function savePurchases(e){
        e.preventDefault();
        await fetch('http://localhost:3001/api/SaveFromStore', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              availableCoins,
              avatarsOwned,
              backgroundsOwned
            }),
        }).then((response) => {
            if (response.ok) {
                // Handle success case
                console.log('Document updated successfully');
                console.log(response);
                alert("Save successful"); 
                navigate({
                  pathname: '/pomodoro',
                  search: createSearchParams({
                    username: username
                  }).toString()
                });
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
        <div>
          <h1>Store</h1>
          <h2>Use your productivity to Personalize {username}</h2>
          <h2>Coins available: {availableCoins}</h2>
          <div id='container'>
            <h3>Avatars</h3>
            <div id='list-of-avatars' className="d-flex flex-row">
              {avatars.map((avatar) => (
                <React.Fragment key={avatar.id}>
                  <div className="card mx-2" style={{ width: '18rem' }}>
                    <img src={avatar.imgSrc['src']} className="card-img-top" alt="..." style={{ width: '17rem', height: '15rem' }}/>
                    <div className="card-body">
                      <h5 className="card-title">{avatar.title}</h5>
                      <p className="card-text">{avatar.description}</p>
                      <p>Cost: {avatar.cost}</p>
                      <p>bought? : {avatar.bought.toString()}</p>
                      {!avatar.bought ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => buyHandler(avatar.cost, avatar.id, avatar.imgSrc['src'], 'avatar')}
                        >
                          Buy
                        </button>
                      ) : null}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <h3>Backgrounds</h3>
            <div id='list-of-backgrounds' className="d-flex flex-row">
              {backgrounds.map((background) => (
                <React.Fragment key={background.id}>
                  <div className="card mx-2" style={{ width: '18rem' }}>
                    <img src={background.imgSrc['src']} className="card-img-top" alt="..." style={{ width: '17rem', height: '15rem' }}/>
                    <div className="card-body">
                      <h5 className="card-title">{background.title}</h5>
                      <p className="card-text">{background.description}</p>
                      <p>Cost: {background.cost}</p>
                      <p>bought? : {background.bought.toString()}</p>
                      {!background.bought ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => buyHandler(background.cost, background.id, background.imgSrc['src'], 'background')}
                        >
                          Buy
                        </button>
                      ) : null}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <button onClick={savePurchases}>Save</button>
          </div>
        </div>
      );
      
}
 
export default Store;