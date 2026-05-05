import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChildSelectionScreen } from '@/screens/auth/ChildSelectionScreen';
import { CreateChildScreen } from '@/screens/auth/CreateChildScreen';
import { Colors } from '@/constants/colors';

const Stack = createNativeStackNavigator();

export const SelectNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.background },
      headerShadowVisible: false,
      headerTitle: '',
      contentStyle: { backgroundColor: Colors.background },
    }}
  >
    <Stack.Screen name="ChildSelection" component={ChildSelectionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateChild" component={CreateChildScreen} />
  </Stack.Navigator>
);
