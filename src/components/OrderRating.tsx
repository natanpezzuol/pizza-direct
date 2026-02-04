import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderRatingProps {
  orderId: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderRating = ({ orderId, userId, onClose, onSuccess }: OrderRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Selecione uma avaliação',
        description: 'Clique nas estrelas para avaliar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('order_ratings')
        .insert({
          order_id: orderId,
          user_id: userId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Avaliação enviada! ⭐',
        description: 'Obrigado pelo seu feedback!',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-3xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            Avalie seu pedido
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1"
              >
                <Star
                  size={40}
                  className={`transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground h-5">
            {ratingLabels[hoveredRating || rating] || 'Toque para avaliar'}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Deixe um comentário (opcional)
          </label>
          <Textarea
            placeholder="Conte como foi sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full h-12 gradient-hero text-primary-foreground font-bold rounded-xl"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              Enviando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send size={18} />
              Enviar Avaliação
            </div>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default OrderRating;