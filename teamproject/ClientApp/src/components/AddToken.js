import React from 'react';
import authService from './api-authorization/AuthorizeService'

const AddToken = (props) => {

    /*const [items, setItems] = useState([]);
    // handle click event of the button to add item
    const addMoreItem = () => {
        setItems(prevItems => [...prevItems, {
            id: prevItems.length,
            value: getRandomNumber()
        }]);
    }*/

    let input = null;
    const setInput = (e) => input = e.value;

    let handleSubmitClick = async () => {
        try {
            const token = await authService.getAccessToken();
            const user = await authService.getUser();

            if (!input || input.length === 0)
                throw new Error("");

            const response = await fetch(`api/YandexTokens`, {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json" },
                body: JSON.stringify({ 'Token': input, 'User_id': user.sub })
            });
            status = response.status;
            alert("Server response status: " + status);

            //const data = await response.json();

            alert(input);
        } catch(err) {
            alert("Error!" + err);
        }
    }

    //useEffect(async () => await loadingUsername(), []);

    return (
        <div>
            <input onChange={(e) => setInput(e.target)} />
            <a className="btn" onClick={handleSubmitClick}>Add Token</a>
        </div>
    );
}

export default AddToken;