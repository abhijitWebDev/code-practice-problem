import { db } from '../db/db.js';
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // create playlist
    const playList = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });
    res.status(200).json({
      success: true,
      message: 'Playlist created sucessfully',
      playList,
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          problem: true,
        },
      },
    });
    res.status(200).json({
      success: true,
      message: 'Playlist fetched successfully',
      playlists,
    });
  } catch (error) {
    console.error('Error geting playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          problem: true,
        },
      },
    });
    if (!playlistId) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Playlist fetched successfully',
      playlist,
    });
  } catch (error) {
    console.error('Error geting playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      res.status(400).json({ error: 'Invalid or missing problem Ids' });
    }

    // create records for each problems in playlist
    const problemsInPlaylist = await db.problemsInPlaylist({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    res.status(201).json({
      success: true,
      message: 'Problem added to playlist successfully',
      problemsInPlaylist,
    });
  } catch (error) {
    console.error('Failed to add the problem to the playlist:', error);
    res
      .status(500)
      .json({ error: 'Failed to add the problem to the playlist' });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    // check if playlist exists
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // delete playlist
    await db.playlist.delete({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing problem Ids' });
    }

    // delete records for each problems in playlist
    const deletedProblems = await db.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Problem removed from playlist successfully',
      deletedCount: deletedProblems.count,
      deletedProblems,
    });
  } catch (error) {
    console.error('Failed to remove the problem from the playlist:', error);
    res
      .status(500)
      .json({ error: 'Failed to remove the problem from the playlist' });
  }
};
