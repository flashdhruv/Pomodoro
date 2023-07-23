import React, { useState, useEffect } from 'react';
import {useSearchParams} from 'react-router-dom';
import audioFile from '../music/timepassing.mp3';
import { useNavigate, Link, createSearchParams } from 'react-router-dom';
import Modal from "react-bootstrap/Modal";

// import addNotification from 'react-push-notification';

function App() {
   // const extendedBreakTime = 4*60;
    const [audio] = useState(new Audio());
    const [workColour, setWorkColour] = useState('rgb(186, 73, 73)');
    const [breakColour, setBreakColour] = useState('rgb(56, 133, 138)');
    const [workTime, setWorkTime] = useState(1*60);
    const [breakTime, setBreakTime] = useState(1*60);
    const [time, setTime] = useState(workTime); // time is in seconds
    const [timerOn, setTimerOn] = useState(false);
    const [timerComplete, setTimerComplete] = useState(false);
    const [activeTab, setActiveTab] = useState('work');
    const [cycleCount, setCycleCount] = useState(0);
    const [coins, SetCoins] = useState(0);
    const [Usercoins, SetUserCoins] = useState(0);
    const [modalisOpen, setmodalIsopen] = useState(false);
    const [avatarsOwned, setAvatarsOwned] = useState([]);
    const [backgroundsOwned, setBackgroundsOwned] = useState([]);
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const navigate = useNavigate();
    
  
    // console.log(searchParams.get('username'));
    // const displayNoti = () => {
    //   addNotification({
    //     title: `Your ${activeTab} cycle is complete!`,
    //     message: 'Return to the page to start your next cycle!',
    //     duration: 5000,
    //     native: true
    //   });
    // }

    useEffect(() => {
      // SetUserCoins((UserCoins ? UserCoins : 0));
      audio.src = audioFile;
      audio.loop = true;
      const fetchUser = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/documents/${username}`, {
            method: 'GET',
          });
          if (response.ok) {
            console.log('Document received successfully');
            const data = await response.json(); // Extract JSON data from the response
            //console.log('Data is:', data.user);
            SetUserCoins(parseInt(data.user.coins));
            setAvatarsOwned(data.user.listofAvatarsOwned);
            setBackgroundsOwned(data.user.listofBackgroundsOwned);
            console.log("backgroundsrc = ", data.user.equippedBackground)
            
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

    useEffect(() => {
      setTime(workTime);
    },[workTime]);
    
    const changeActiveTab = (param) => {
      switch(param){
        case 'work':
          setActiveTab('work');
          setTime(workTime);
          // setBackgroundColor('rgb(186, 73, 73)');
          break;
        case 'break':
          setActiveTab('break');
          setTime(breakTime);
          // setBackgroundColor('rgb(56, 133, 138)');
          break;
      }
    }

    useEffect(() => {      
      setActiveTab(timerComplete ? activeTab === 'work' ? 'break' : 'work' : activeTab === 'work' ? 'work' : 'break');
      SetCoins(Math.floor(cycleCount/2));
      
    }, [timerComplete]);


    useEffect(() => {
      let timerId;
      if (timerOn && time > 0) {
        timerId = setTimeout(() => {
          setTime(prevTime => prevTime - 1);
        }, 1000);
      } else if (timerOn && time === 0) {
        // displayNoti();
        setTimerComplete(true);
        setCycleCount(prevCount => prevCount + 1);
        setTime(activeTab === 'work' ?   breakTime : workTime); 
        setTimerOn(false);
        audio.pause();
      }
      return () => clearTimeout(timerId);
    }, [time, timerOn, activeTab]);
  
    const startTimer = () => {
      setTimerOn(true);
      setTimerComplete(false);
      audio.play();
    };
  
    const stopTimer = () => {
      setTimerOn(false);
      audio.pause();
    };
  
    const formatTime = () => {
      console.log(time);
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };

    const goToProfile = () => {
      navigate({
        pathname: '/profile',
        search: createSearchParams({
          username: username
        }).toString()
      });
    }

    const goToStore = () => {
      navigate({
        pathname: '/store',
        search: createSearchParams({
          username: username,
          coins: (coins + Usercoins),
          arrayOfAvatars : JSON.stringify(avatarsOwned),
          arrOfBackgrounds : JSON.stringify(backgroundsOwned)
        }).toString()
      });
    }

    const showModal = () => {
      setmodalIsopen(true);
    };
  
    const hideModal = () => {
      setmodalIsopen(false);
    };

    async function saveData(e){
      e.preventDefault();
      console.log(username);
      await fetch('http://localhost:3001/api/documents',{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          coins,
          cycleCount,
          currentMonthIndex
        }),
      }).then((response) => {
        if (response.ok) {
          // Handle success case
          console.log('Document updated successfully');
          console.log(response);
          alert("Save successful");
          SetCoins(0);
          setCycleCount(0);
          
        } else {
          // Handle failure case
          console.error('Failed to update document');
          
        }
      }).then(data => console.log("name is: ",data))
      .catch((error) => {
        console.error('Error updating document:', error);
        // Handle error case
      });
    };

    const handleBreakColorChange = (event) => {
    setBreakColour(event.target.value);
  };

  const handleWorkColorChange = (event) => {
    setWorkColour(event.target.value);
  };

    useEffect(() => {
      const body = document.body;
        if(activeTab === "work"){
          body.style.backgroundColor = workColour;
        }else{
          body.style.backgroundColor = breakColour;
        }
        
    }, [workColour, breakColour]);

    return (
      <React.Fragment>
      <body style={{ background:(activeTab === 'work' ? workColour : breakColour), minHeight: '100vh' }}>
 
      <div>
        <nav className="navbar navbar-light bg-light">
          <a className="navbar-brand" style={{ marginLeft: '10px' }}>PomyDory</a>
          <p onClick={goToStore}> Store</p>
          <p></p>
          <div className="ml-auto d-flex align-items-center">
            <p className="my-2 my-sm-0 text-center" style={{ marginRight: '10px' }} type="submit" onClick={showModal}>Settings</p>
            {username !== 'guest' && <p className="my-2 my-sm-0 text-center" style={{ marginRight: '10px' }} type="submit" onClick={goToProfile}>Profile</p>}
          </div>
        </nav>
      </div>

      {/* <!-- Modal --> */}
      <Modal show={modalisOpen}>
        <Modal.Header>Settings</Modal.Header>
        <Modal.Body>
          <form>
            <p>Timer</p>
            <label>
              Work Time:
              <input
                type="number"
                value={workTime / 60}
                onChange={(event) => {
                  setWorkTime(event.target.value * 60);
                }}
              />
            </label>

            <label>
              Break Time:
              <input
                type="number"
                value={breakTime / 60}
                onChange={(event) => {
                  setBreakTime(event.target.value * 60);
                }}
              />
            </label>

            <hr/>
              <p>Theme</p>
              <p>Work Theme</p>
              <input
                type="color"
                id="colorInput"
                value={workColour}
                onChange={handleWorkColorChange}
              /> 
              <p>Break Theme</p>
                <input
                  type="color"
                  id="colorInput"
                  value={breakColour}
                  onChange={handleBreakColorChange}
                />
          </form>
        </Modal.Body>
        <Modal.Footer><button onClick={hideModal}>Okay</button></Modal.Footer>
      </Modal>


      <div>
        <div className='text-center'>
          <button onClick={() => changeActiveTab('work')}>Work</button> 
          <button onClick={() => changeActiveTab('break')}>Break</button> 
        </div>
        <h1 className='text-center'>{activeTab.toString()} Timer</h1>
        {/* <h2>UserName is : {username}</h2> */}
        <h2 className='text-center'>{formatTime()}</h2>
        {/* make bigger */}
        <div className='text-center'>
        {timerOn ? (
          <button onClick={stopTimer}>Stop</button>
        ) : (
          <button onClick={startTimer}>Start</button>
        )}
        </div>
        <div className='text-center'>
          <h2>Today's Stats!</h2>
          <h3>Cycles Completed: {Math.floor(cycleCount/2)}</h3>
          <h3>Coins started off with: {Usercoins}</h3>
          <h3>Coins Earned Today: {coins}</h3>
          <h3>Total Coins: {Usercoins + coins}</h3>
        </div>
        
        
        {username !== 'guest' ? <button onClick={saveData}>Save Progress</button>: ''}
        
        </div>
        </body>
      </React.Fragment>
    )
}

export default App;
