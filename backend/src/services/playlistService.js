const logger = require('../utils/logger');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const BranchPlaylist = require('../models/BranchPlaylist');
const AudioFile = require('../models/AudioFile');
const Branch = require('../models/Branch');


class PlaylistService {


    // ============================================================
    // INTERNAL VALIDATION
    // ============================================================

    async validateBranch(branchId, transaction = null) {

        if (!branchId)
            throw new Error("branchId required");


        const branch = await Branch.findByPk(branchId, {
            transaction,
            lock: transaction ? transaction.LOCK.SHARE : undefined
        });


        if (!branch)
            throw new Error("Branch not found");


        return branch;

    }



    // ============================================================
    // AGENT PAYLOAD
    // ============================================================

    async buildPlaylistPayload(branchId) {

        await this.validateBranch(branchId);


        const items = await BranchPlaylist.findAll({

            where: {
                branch_id: branchId,
                is_active: true
            },

            include: [{
                model: AudioFile,
                as: 'audio',
                required: true,
                where: {
                    is_active: true
                },
                attributes: [
                    'id',
                    'title',
                    'audio_type',
                    'file_url',
                    'duration_seconds',
                    'language'
                ]
            }],

            order: [['order_index', 'ASC']]

        });


        return items.map(item => ({

            playlist_item_id: item.id,

            audio_id: item.audio.id,

            title: item.audio.title,

            audio_type: item.audio.audio_type,

            file_url: item.audio.file_url,

            duration: item.audio.duration_seconds,

            language: item.audio.language,

            order_index: item.order_index

        }));

    }



    // ============================================================
    // ADMIN VIEW
    // ============================================================

    async getPlaylistForAdmin(branchId) {

        await this.validateBranch(branchId);


        const items = await BranchPlaylist.findAll({

            where: {
                branch_id: branchId
            },

            include: [{
                model: AudioFile,
                as: 'audio',
                attributes: [
                    'id',
                    'title',
                    'audio_type',
                    'file_url',
                    'duration_seconds',
                    'language',
                    'is_active'
                ]
            }],

            order: [['order_index', 'ASC']]

        });


        return items;

    }



    // ============================================================
    // ACTIVE ONLY
    // ============================================================

    async getActivePlaylist(branchId) {

        return this.buildPlaylistPayload(branchId);

    }



    // ============================================================
    // ADD TRACK
    // ============================================================

    async addToPlaylist(branchId, audioId) {

        const t = await sequelize.transaction();


        try {

            await this.validateBranch(branchId, t);


            const audio = await AudioFile.findByPk(audioId, {

                transaction: t,
                lock: t.LOCK.SHARE

            });

            if (!audio || !audio.is_active)
                throw new Error("Audio not found");

            const existing = await BranchPlaylist.findOne({

                where: {
                    branch_id: branchId,
                    audio_id: audioId
                },
                paranoid: false,
                transaction: t,
                lock: t.LOCK.UPDATE

            });

            if (existing) {
                if (existing.deleted_at) {

                    await existing.restore({ transaction: t });

                    await existing.update({
                        is_active: true
                    }, { transaction: t });
                    await t.commit();
                    return existing;

                }
                throw new Error("Audio already in playlist");
            }



            const max = await BranchPlaylist.max('order_index', {
                where: { branch_id: branchId },
                transaction: t

            });

            const item = await BranchPlaylist.create({

                branch_id: branchId,

                audio_id: audioId,

                order_index: max !== null ? max + 1 : 0,

                is_active: true

            }, { transaction: t });

            await t.commit();
            return item;

        }
        catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // ============================================================
    // REMOVE TRACK
    // ============================================================

    async removeFromPlaylist(branchId, itemId) {

        const item = await BranchPlaylist.findOne({
            where: {
                id: itemId,
                branch_id: branchId
            }
        });

        if (!item)
            throw new Error("Playlist item not found");
        await item.destroy();
        return true;
    }

    // ============================================================
    // TOGGLE ACTIVE
    // ============================================================

    async toggleItem(branchId, itemId) {
        const item = await BranchPlaylist.findOne({
            where: {
                id: itemId,
                branch_id: branchId
            }

        });

        if (!item)
            throw new Error("Playlist item not found");
        item.is_active = !item.is_active;
        await item.save();
        return {

            id: item.id,

            is_active: item.is_active

        };

    }
    // ============================================================
    // CLEAR PLAYLIST
    // ============================================================

    async clearPlaylist(branchId) {
        await this.validateBranch(branchId);
        await BranchPlaylist.destroy({

            where: {
                branch_id: branchId
            }

        });
        return true;

    }

    // ============================================================
    // REORDER PLAYLIST (ENTERPRISE SAFE)
    // ============================================================

    async reorderPlaylist(branchId, items) {

        if (!Array.isArray(items))
            throw new Error("items array required");
        const t = await sequelize.transaction();
        try {
            await this.validateBranch(branchId, t);


            for (const item of items) {

                await BranchPlaylist.update({

                    order_index: item.order_index

                }, {

                    where: {

                        id: item.id,

                        branch_id: branchId

                    },
                    transaction: t

                });

            }
            await t.commit();

            return true;

        } catch (error) {
            await t.rollback();
            throw error;
        }

    }



}



module.exports = new PlaylistService();