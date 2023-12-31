import { Injectable } from "@nestjs/common"

import { PrismaService } from "./../prisma/prisma.service"
import { getUserPostsQuery } from "./prismaQuery"

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}
	getUserInfo(username: string) {
		return this.prismaService.user.findUnique({
			where: {
				username
			},
			select: {
				id: true,
				username: true,
				createdAt: true
			}
		})
	}

	async getUserPosts(username: string, cursor: number | null) {
		let result = null
		if (!cursor) {
			result = await this.prismaService.post.findMany({
				...getUserPostsQuery(username),
				orderBy: {
					createdAt: "desc"
				}
			})
		} else {
			result = await this.prismaService.post.findMany({
				...getUserPostsQuery(username),
				cursor: {
					id: cursor
				},
				skip: 1,
				orderBy: {
					createdAt: "desc"
				}
			})
		}
		const myCursor = result.length === 20 ? result[19].id : null

		return {
			posts: result,
			cursor: myCursor
		}
	}

	async getUsersReddits(id: number) {
		const subReddits = await this.prismaService.user.findFirst({
			where: {
				id
			},
			select: {
				SubscribedSubReddits: {
					include: {
						subReddit: true
					}
				}
			}
		})
		return subReddits.SubscribedSubReddits
	}
}
