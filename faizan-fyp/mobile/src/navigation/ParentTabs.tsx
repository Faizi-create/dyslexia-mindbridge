import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ParentOverviewScreen } from '@/screens/parent/ParentOverviewScreen';
import { ParentInsightsScreen } from '@/screens/parent/ParentInsightsScreen';
import { ParentSettingsScreen } from '@/screens/parent/ParentSettingsScreen';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { FontFamily } from '@/constants/typography';
import { ParentTabsParamList } from '@/types';

const Tab = createBottomTabNavigator<ParentTabsParamList>();

const TabIcon: React.FC<{
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused: boolean;
  isDark: boolean;
}> = ({ name, color, focused, isDark }) => {
  if (focused) {
    return (
      <LinearGradient
        colors={isDark ? ['#3A4258', '#2D344A'] : ['#EAF1FE', '#DCE8FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBubble}
      >
        <Ionicons name={name} size={22} color={color} />
      </LinearGradient>
    );
  }
  return (
    <View style={styles.iconDim}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
};

export const ParentTabs: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 6,
        },
        tabBarLabelStyle: { fontFamily: FontFamily.semiBold, fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={ParentOverviewScreen}
        options={{
          tabBarLabel: t('overview'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'pie-chart' : 'pie-chart-outline'} color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={ParentInsightsScreen}
        options={{
          tabBarLabel: t('insights'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bulb' : 'bulb-outline'} color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={ParentSettingsScreen}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconBubble: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDim: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ParentTabs;
