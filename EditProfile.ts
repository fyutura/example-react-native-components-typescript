import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NavigationParams, NavigationScreenProp } from 'react-navigation'
import { SYSTEM_COLORS } from '../../../constants/system'
import Icon from '../../components/Icon'
import { Input } from 'react-native-elements'
import Space from '../../components/Space'
import PhoneNumberInput from '../../modules/common/PhoneNumberInput'
import UserService from '../../../services/user.service'
import ProfileEditHeader from '../../modules/Profile/ProfileEditHeader'
import Message from '../../components/Message'
import SkillLevelService from '../../../services/skill-level.service'
import Select from '../../modules/common/Select'
import SelectLabel from '../../components/SelectLabel'
import { KeyboardAvoidingView } from 'react-native'
import SelectImage from '../../modules/common/SelectImage'
import Tap from '../../components/Tap'
import { removeEmptyProps } from '../../../helpers/base'
import { EDIT_PROFILE } from '../../../constants/translations/Profile/edit-profile'
import { currentLang } from '../../../config/environment'
import Loader from '../../components/Loader'
import Analytics from '../../services/Analytics'

const userService = new UserService()
const skillLevelService = new SkillLevelService()

const Form = styled.ScrollView`
  padding-left: 16px;
  padding-right: 16px;
  background: white;
  margin-top: 8px;
`

const Label = styled.Text`
  color: ${SYSTEM_COLORS.text.title};
  font-weight: bold;
  font-size: 12px;
`

const Phone = styled.View`
  flex-direction: row;
`

const Photo = styled.Image`
  width: 90px;
  height: 90px;
  border-radius: 90px;
  z-index: 2;
`

const inputStyles = {
  borderColor: '#E1E8EE',
  paddingLeft: 0,
  paddingRight: 0,
}

const placeholderStyle = {
  fontSize: 16,
  color: 'red',
}

interface EditProfileProps {
  navigation: NavigationScreenProp<any, NavigationParams>
  screenProps: any
}

type ProfileKeys =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'experience_years'
  | 'hourly_rate'
  | 'skill_level'
  | 'phone_number'

export default function EditProfile(props: EditProfileProps) {
  const [user, setUser] = useState({
    first_name: props.screenProps.currentUser.first_name,
    last_name: props.screenProps.currentUser.last_name,
    email: props.screenProps.currentUser.email,
    experience_years: props.screenProps.currentUser.experience_years,
    hourly_rate: props.screenProps.currentUser.hourly_rate,
    skill_level: props.screenProps.currentUser.skill_level,
    phone_number: props.screenProps.currentUser.phone_number && props.screenProps.currentUser.phone_number.substr(1),
  })

  const [loading, setLoading] = useState(false)
  const [phonePrefix, setPhonePrefix] = useState(1)
  const [error_on_save, set_error_on_save] = useState('')
  const [skillLevels, setSkillLevels] = useState(null)
  const [showSelectSkillLevel, setShowSelectSkillLevel] = useState(false)
  const [selectPhoto, setSelectPhoto] = useState(false)
  const [profilePicture, setProfilePicture] = useState(props.screenProps.currentUser.profile_picture_link)

  const fetchSkillLevels = async () => {
    const result = await skillLevelService.getAll()
    setSkillLevels(result)
  }

  useEffect(() => {
    fetchSkillLevels()
  }, [])

  const handleChange = (e: string, key: ProfileKeys) => setUser({ ...user, [key]: e })

  const handleSave = async () => {
    Analytics.getInstance().logEvent('Save Edit Profile Click')

    try {
      setLoading(true)
      const res = await userService.addUserDetails(
        removeEmptyProps({
          ...user,
          phone_number: phonePrefix + user.phone_number,
        }),
      )
      const response = profilePicture && profilePicture.uri ? await userService.addProfilePicture(profilePicture) : {}
      setLoading(false)
      if (res.error || response.error) {
        set_error_on_save(res.error || response.error)
        return setTimeout(() => set_error_on_save(''), 3000)
      }
      return props.navigation.navigate('Profile')
    } catch (e) {
      console.log('Error: ', e)
      setLoading(false)
      set_error_on_save(e)
      return setTimeout(() => set_error_on_save(''), 3000)
    }
  }

  if (showSelectSkillLevel) {
    return (
      <Select
        onSelect={e => {
          setShowSelectSkillLevel(false)
          handleChange(e, 'skill_level')
        }}
        title="Select skill level"
        selected={user.skill_level}
        onClose={() => setShowSelectSkillLevel(false)}
        options={skillLevels}
      />
    )
  }

  if (selectPhoto) {
    return (
      <SelectImage
        onCancel={() => setSelectPhoto(false)}
        onNext={image => {
          setSelectPhoto(false)
          setProfilePicture(image)
        }}
      />
    )
  }

  return (
    <>
      {loading && <Loader />}
      <ProfileEditHeader
        style={{ height: 110 }}
        title={
          profilePicture ? (
            <Tap onPress={() => setSelectPhoto(true)}>
              <Photo source={{ uri: profilePicture.uri || profilePicture }} />
            </Tap>
          ) : (
            <Icon onPress={() => setSelectPhoto(true)} icon="addPhoto" />
          )
        }
        goBack={props.navigation.goBack}
        rightButton={{
          label: EDIT_PROFILE[currentLang].headerTitle.rightButton,
          onPress: async () => await handleSave(),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        enabled
        behavior="padding"
        keyboardVerticalOffset={30}
      >
        <Form>
          <Space size={25} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.firstName}</Label>
          {inputField(user.first_name, e => handleChange(e, 'first_name'), 'Enter your First name')}
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.lastName}</Label>
          {inputField(user.last_name, e => handleChange(e, 'last_name'), 'Enter your Last name')}
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.email}</Label>
          {inputField(user.email, e => handleChange(e, 'email'), 'Enter your Email address')}
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.skillLevel}</Label>
          <SelectLabel onPress={() => setShowSelectSkillLevel(true)} label={user.skill_level} />
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.hourlyRate}</Label>
          {inputField(
            user.hourly_rate,
            e => Number.isInteger(Number(e)) && handleChange(e, 'hourly_rate'),
            'Enter your Hourly rate',
            'number-pad',
          )}
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.workExperience}</Label>
          {inputField(
            user.experience_years,
            e => Number.isInteger(Number(e)) && handleChange(e, 'experience_years'),
            'Enter your Hourly rate',
            'number-pad',
          )}
          <Space size={30} />
          <Label>{EDIT_PROFILE[currentLang].editProfileTitles.phoneNumber}</Label>
          <Space size={8} />
          <Phone>
            <PhoneNumberInput
              codePrefix={phonePrefix}
              placeholder={'Enter your phone number'}
              value={user.phone_number.toString()}
              onChange={e => handleChange(e, 'phone_number')}
            />
          </Phone>
          <Space size={25} />
        </Form>
      </KeyboardAvoidingView>
      {error_on_save.length > 0 && <Message message={error_on_save} />}
    </>
  )
}

const inputField = (value: string, onChange: (e: string) => void, placeholder: string, keyboardType?: any) => (
  <Input
    inputContainerStyle={inputStyles}
    labelStyle={placeholderStyle}
    containerStyle={inputStyles}
    value={(value && value.toString()) || ''}
    placeholder={placeholder}
    onChange={e => onChange(e.nativeEvent.text)}
    placeholderTextColor={'#C6CCD1'}
    keyboardType={keyboardType ? keyboardType : 'default'}
  />
)
