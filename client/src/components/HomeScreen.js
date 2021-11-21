import React, { useState, useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import ListCard from './ListCard.js'
import { Fab, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import DeleteListDialog from './DeleteListDialog'

export default function HomeScreen() {
    const { store } = useContext(GlobalStoreContext);
    const [showAlert, setShowAlert] = useState(false)
    const [listName, setListName] = useState('')

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    function handleCreateNewList() {
        store.createNewList();
    }
    let listCards = "";
    if (store) {
        listCards =
            <List sx={{ width: '90%', left: '5%' }}>
                {
                    store.idNamePairs.map((pair) => (
                        <ListCard
                            key={pair._id}
                            idNamePair={pair}
                            selected={false}
                            setShowAlertCallback={setShowAlert}
                            setListNameCallback={setListName}
                        />
                    ))
                }
            </List>
    }
    return (
        <div id="top5-list-selector">
            <DeleteListDialog
                showAlert={showAlert}
                name={listName}
                setShowAlertCallback={setShowAlert}
            />
            <div id="list-selector-heading">
                <Fab size='small'
                    disabled={store.isListNameEditActive}
                    color="primary"
                    onClick={handleCreateNewList}>
                    <AddIcon fontSize='medium' />
                </Fab>
                <Typography variant="h4">Your Lists</Typography>
            </div>
            <div id="list-selector-list">
                {listCards}
            </div>
        </div>
    )
}