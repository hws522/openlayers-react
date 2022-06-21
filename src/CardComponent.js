import { Card } from 'antd'
import React from 'react'
import GPSMap from './gps/GPSMap'
import PointAnimation from './gps/PointAnimation'
import MoveAnimation from './gps/MoveAnimation'

function CardComponent() {
    return (
        <>
            <Card>
                {/* <GPSMap /> */}
                {/* <PointAnimation /> */}
                <MoveAnimation />
            </Card>
        </>
    )
}

export default CardComponent