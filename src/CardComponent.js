import { Card } from 'antd'
import React from 'react'
import GPSMap from './gps/GPSMap'
import PointAnimation from './gps/PointAnimation'

function CardComponent() {
    return (
        <>
            <Card>
                {/* <GPSMap /> */}
                <PointAnimation />
            </Card>
        </>
    )
}

export default CardComponent