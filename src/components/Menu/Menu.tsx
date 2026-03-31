import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const Menu: React.FC = () => {
    const [value, setValue] = useState(0);

    return (
        <Paper
            sx={{
                display: { xs: 'block', sm: 'none' }, // Тільки для телефонів
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#302d2c',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                overflow: 'hidden',
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels={false}
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}
                sx={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    backgroundColor: 'transparent',
                    height: '70px',
                    '& .MuiBottomNavigationAction-root': {
                        color: 'rgba(255, 255, 255, 0.6)', // Стандартний колір неактивних іконок
                        transition: 'color 0.25s ease',

                        '&:active': {
                            color: '#ff2400 !important',
                        },
                        '&:active .MuiSvgIcon-root': {
                            transform: 'scale(1.1)', // Зменшено з 1.3 для спокійнішого ефекту
                        }
                    },
                    '& .Mui-selected': {
                        color: '#ffffff !important', // Коли палець відпустили і кнопка стала активною — вона буде білою
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: '28px',

                    }
                }}
            >
                <BottomNavigationAction id="nav-home-btn" icon={<HomeOutlinedIcon />} disableRipple />
                <BottomNavigationAction id="nav-add-btn" icon={<AddCircleOutlineIcon />} disableRipple />
                <BottomNavigationAction id="nav-bookmarks-btn" icon={<BookmarkBorderIcon />} disableRipple />
                <BottomNavigationAction id="nav-profile-btn" icon={<PersonOutlineIcon />} disableRipple />
            </BottomNavigation>
        </Paper>
    );
};

export default Menu;
