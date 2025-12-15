import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route"
import { AuthRoutes } from "../modules/auth/auth.route"
import { DivisionRoutes } from "../modules/division/division.route"
import { DistrictRoutes } from "../modules/district/district.route"
import { RideRoutes } from "../modules/ride/ride.route"

export const router = Router()
const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/division",
        route: DivisionRoutes
    },
    {
        path: "/district",
        route: DistrictRoutes
    },
    {
        path: "/ride",
        route: RideRoutes
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

// export default router