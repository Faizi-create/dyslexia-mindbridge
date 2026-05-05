import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChildTabs } from './ChildTabs';
import { ExerciseScreen } from '@/screens/child/ExerciseScreen';
import { AssessmentScreen } from '@/screens/child/AssessmentScreen';
import { Colors } from '@/constants/colors';
import { ChildStackParamList } from '@/types';

const Stack = createNativeStackNavigator<ChildStackParamList>();

export const ChildNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
    }}
  >
    <Stack.Screen name="Main" component={ChildTabs} />
    <Stack.Screen name="Exercise" component={ExerciseScreen} />
    <Stack.Screen name="Assessment" component={AssessmentScreen} />
  </Stack.Navigator>
);
