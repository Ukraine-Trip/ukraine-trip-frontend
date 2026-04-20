import React from 'react';
import { Box, Avatar, Stack, Typography } from '@mui/material';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  CommonInput,
  PrimaryButton,
  SecondaryButton
} from '../../style/common.tsx';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export const AccountPage: React.FC = () => {
  const tempUser: UserData = {
    firstName: "Guest",
    lastName: "Traveler",
    email: "guest@example.com",
  };

  const handleSave = () => {
    console.log("Saving data to the database...");
  };

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>Profile Settings</SubTitle>
        <PageTitle>My Account</PageTitle>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: 'flex-start'
          }}
        >

          <Box
            sx={{
              width: { xs: '100%', md: '250px' },
              textAlign: 'center',
              flexShrink: 0
            }}
          >
            <Avatar
              src={tempUser.avatarUrl}
              sx={{
                width: 160,
                height: 160,
                margin: '0 auto',
                mb: 2,
                bgcolor: '#f0f0f0',
                color: '#000',
                border: '1px solid #e0e0e0',
                fontSize: '3rem'
              }}
            >
              {tempUser.firstName[0]}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                fontWeight: 700
              }}
            >
              Status: Active Explorer
            </Typography>
            <SecondaryButton variant="outlined" size="small" sx={{ fontSize: '0.6rem', width: '100%' }}>
              Change Photo
            </SecondaryButton>
          </Box>

          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Box>
                <SubTitle>First Name</SubTitle>
                <CommonInput
                  fullWidth
                  defaultValue={tempUser.firstName}
                />
              </Box>

              <Box>
                <SubTitle>Last Name</SubTitle>
                <CommonInput
                  fullWidth
                  defaultValue={tempUser.lastName}
                />
              </Box>

              <Box>
                <SubTitle>Email Address</SubTitle>
                <CommonInput
                  fullWidth
                  defaultValue={tempUser.email}
                  disabled
                />
              </Box>

              <Box sx={{ pt: 2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <PrimaryButton onClick={handleSave}>
                  Save Changes
                </PrimaryButton>
              </Box>
            </Stack>
          </Box>

        </Box>
      </Box>
    </PageWrapper>
  );
};