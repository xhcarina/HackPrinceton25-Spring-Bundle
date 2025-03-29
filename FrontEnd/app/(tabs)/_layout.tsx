import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { IconButton } from 'react-native-paper';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerRight: () => (
            <IconButton
              icon="account-cog"
              size={24}
              onPress={() => setIsProfileModalVisible(true)}
              style={{ marginRight: 8 }}
            />
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stories"
          options={{
            title: 'Stories',
            tabBarIcon: ({ color }) => <MaterialIcons name="photo-library" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="investments"
          options={{
            title: 'Investments',
            tabBarIcon: ({ color }) => <FontAwesome name="line-chart" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="loans"
          options={{
            title: 'Loans',
            tabBarIcon: ({ color }) => <FontAwesome name="money" size={24} color={color} />,
          }}
        />
      </Tabs>
      <ProfileSettingsModal
        visible={isProfileModalVisible}
        onDismiss={() => setIsProfileModalVisible(false)}
      />
    </>
  );
}
