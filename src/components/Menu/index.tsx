import React, { useState } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

// Імпортуємо наші стилізовані елементи, але називаємо їх так, як ти звик
import {MenuPaper as Paper, NavigationAction as BottomNavigationAction, StyledBottomNavigation as BottomNavigation} from './styled.tsx';

export const Menu: React.FC = () => {
    const [value, setValue] = useState(0);

    return (

        <Paper elevation={3}>
            <BottomNavigation
                showLabels={false}
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}

            >
                <BottomNavigationAction
                    id="nav-home-btn"
                    icon={<HomeOutlinedIcon />}
                    disableRipple
                />
                <BottomNavigationAction
                    id="nav-add-btn"
                    icon={<AddCircleOutlineIcon />}
                    disableRipple
                />
                <BottomNavigationAction
                    id="nav-bookmarks-btn"
                    icon={<BookmarkBorderIcon />}
                    disableRipple
                />
                <BottomNavigationAction
                    id="nav-profile-btn"
                    icon={<PersonOutlineIcon />}
                    disableRipple
                />
            </BottomNavigation>
        </Paper>
    );
};