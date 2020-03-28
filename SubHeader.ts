import Icon, { SystemIcons } from '../../components/Icon'
import Heading from '../../components/Heading'
import React from 'react'
import { SYSTEM_COLORS } from '../../../constants/system'
import styled from 'styled-components'

const Container = styled.View`
  background: white;
`

const Title = styled.View`
  flex-direction: row;
  margin-top: 24px;
  padding-left: 16px;
  align-items: center;
  margin-bottom: 8px;
`

const Description = styled.Text`
  color: ${SYSTEM_COLORS.text.light};
  line-height: 18px;
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 24px;
`

interface SubHeaderProps {
  icon: SystemIcons
  title: string
  description: string
}

export default function SubHeader(props: SubHeaderProps) {
  const { icon, title, description } = props
  return (
    <Container>
      <Title>
        <Icon icon={icon} />
        <Heading size={22} style={{ marginLeft: 13 }} label={title} />
      </Title>
      <Description>{description}</Description>
    </Container>
  )
}
